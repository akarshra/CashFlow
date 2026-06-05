package com.example.expensetracker.service;

import com.example.expensetracker.model.entity.BankAccount;
import com.example.expensetracker.model.entity.BankTransaction;
import com.example.expensetracker.model.entity.User;
import com.example.expensetracker.repository.BankAccountRepository;
import com.example.expensetracker.repository.BankTransactionRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.client.HttpClientErrorException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;

import java.time.LocalDate;
import java.util.*;

@Service
public class PlaidService {

    private static final Logger log = LoggerFactory.getLogger(PlaidService.class);

    private final BankAccountRepository bankAccountRepository;
    private final BankTransactionRepository bankTransactionRepository;
    private final RestTemplate restTemplate = new RestTemplate();

    @Value("${PLAID_CLIENT_ID:}")
    private String plaidClientId;

    @Value("${PLAID_SECRET:}")
    private String plaidSecret;

    @Value("${PLAID_ENV:sandbox}")
    private String plaidEnv;

    public PlaidService(BankAccountRepository bankAccountRepository, BankTransactionRepository bankTransactionRepository) {
        this.bankAccountRepository = bankAccountRepository;
        this.bankTransactionRepository = bankTransactionRepository;
    }

    @EventListener(ApplicationReadyEvent.class)
    public void onApplicationReady() {
        boolean configured = isPlaidConfigured();
        log.info("Plaid configuration present={}, env={}", configured, plaidEnv);
        if (configured) {
            String masked = plaidClientId == null ? "" : (plaidClientId.length() > 4 ? "****" + plaidClientId.substring(plaidClientId.length() - 4) : plaidClientId);
            log.info("PLAID_CLIENT_ID (masked)={}", masked);
        }
    }

    public Map<String, String> createLinkToken(User user) {
        if (isPlaidConfigured()) {
            try {
                Map<String, Object> request = new HashMap<>();
                request.put("client_id", plaidClientId);
                request.put("secret", plaidSecret);
                request.put("client_name", "CashFlow Enterprise");
                request.put("language", "en");
                request.put("country_codes", Collections.singletonList("US"));
                request.put("products", Collections.singletonList("transactions"));
                request.put("user", Map.of("client_user_id", user.getEmail()));
                request.put("webhook", "");
                request.put("link_customization_name", "default");
                request.put("account_filters", Map.of("depository", Map.of("account_subtypes", Collections.singletonList("checking"))));

                @SuppressWarnings("unchecked")
                Map<String, Object> response = restTemplate.postForObject(plaidBaseUrl() + "/link/token/create", request, Map.class);
                if (response != null && response.containsKey("link_token")) {
                    return Map.of("link_token", Objects.toString(response.get("link_token"), ""));
                }
            } catch (HttpClientErrorException ex) {
                // fall through to stub path
            }
        }
        return Map.of("link_token", "sandbox-link-token-placeholder");
    }

    @Transactional
    public void exchangePublicToken(User user, String publicToken) {
        if (!isPlaidConfigured()) {
            createStubBankData(user);
            return;
        }

        try {
            Map<String, Object> exchangeRequest = Map.of(
                    "client_id", plaidClientId,
                    "secret", plaidSecret,
                    "public_token", publicToken
            );
            @SuppressWarnings("unchecked")
            Map<String, Object> exchangeResponse = restTemplate.postForObject(plaidBaseUrl() + "/item/public_token/exchange", exchangeRequest, Map.class);
            if (exchangeResponse == null || !exchangeResponse.containsKey("access_token")) {
                createStubBankData(user);
                return;
            }

            String accessToken = Objects.toString(exchangeResponse.get("access_token"), "");
            syncTransactions(user, accessToken);
        } catch (Exception ex) {
            createStubBankData(user);
        }
    }

    public List<BankTransaction> listTransactions(User user) {
        return bankTransactionRepository.findByUser(user);
    }

    private boolean isPlaidConfigured() {
        return plaidClientId != null && !plaidClientId.isBlank() && plaidSecret != null && !plaidSecret.isBlank();
    }

    private String plaidBaseUrl() {
        return "https://" + plaidEnv + ".plaid.com";
    }

    private void syncTransactions(User user, String accessToken) {
        Map<String, Object> accountRequest = Map.of(
                "client_id", plaidClientId,
                "secret", plaidSecret,
                "access_token", accessToken
        );

        try {
            @SuppressWarnings("unchecked")
            Map<String, Object> accountResponse = restTemplate.postForObject(plaidBaseUrl() + "/accounts/get", accountRequest, Map.class);
            List<Map<String, Object>> accounts = safeListOfMap(accountResponse == null ? null : accountResponse.get("accounts"));
            BankAccount account = createBankAccountFromPlaid(user, accessToken, accounts);
            fetchAndSaveTransactions(user, accessToken, account);
        } catch (Exception e) {
            createStubBankData(user);
        }
    }

    private BankAccount createBankAccountFromPlaid(User user, String accessToken, List<Map<String, Object>> accounts) {
        BankAccount acct = new BankAccount();
        acct.setUser(user);
        acct.setProvider("plaid");
        acct.setProviderAccountId(UUID.randomUUID().toString());
        acct.setAccessToken(accessToken);
        if (!accounts.isEmpty()) {
            Map<String, Object> raw = accounts.get(0);
            acct.setName(Objects.toString(raw.getOrDefault("name", "Plaid Account"), ""));
            acct.setMask(Objects.toString(raw.getOrDefault("mask", ""), ""));
            acct.setType(Objects.toString(raw.getOrDefault("type", ""), ""));
        } else {
            acct.setName("Plaid Account");
        }
        return bankAccountRepository.save(acct);
    }

    private void fetchAndSaveTransactions(User user, String accessToken, BankAccount account) {
        LocalDate toDate = LocalDate.now();
        LocalDate fromDate = toDate.minusDays(45);
        Map<String, Object> transactionsRequest = Map.of(
                "client_id", plaidClientId,
                "secret", plaidSecret,
                "access_token", accessToken,
                "start_date", fromDate.toString(),
                "end_date", toDate.toString(),
                "options", Map.of("count", 50, "offset", 0)
        );

        @SuppressWarnings("unchecked")
        Map<String, Object> transactionsResponse = restTemplate.postForObject(plaidBaseUrl() + "/transactions/get", transactionsRequest, Map.class);
        if (transactionsResponse != null) {
            List<Map<String, Object>> items = safeListOfMap(transactionsResponse.get("transactions"));
            for (Map<String, Object> tx : items) {
                BankTransaction transaction = new BankTransaction();
                transaction.setUser(user);
                transaction.setBankAccount(account);
                transaction.setDescription(Objects.toString(tx.getOrDefault("name", "Plaid Transaction"), ""));
                Object amountValue = tx.get("amount");
                transaction.setAmount(amountValue instanceof Number ? ((Number) amountValue).doubleValue() : 0.0);
                transaction.setTransactionDate(LocalDate.parse(Objects.toString(tx.getOrDefault("date", toDate.toString()), toDate.toString())));
                List<String> categories = toStringList(tx.get("category"));
                transaction.setCategory(categories.isEmpty() ? "Uncategorized" : categories.get(categories.size() - 1));
                bankTransactionRepository.save(transaction);
            }
        }
    }

    private List<Map<String, Object>> safeListOfMap(Object obj) {
        if (obj instanceof List<?>) {
            List<?> raw = (List<?>) obj;
            List<Map<String, Object>> out = new ArrayList<>();
            for (Object o : raw) {
                if (o instanceof Map) {
                    @SuppressWarnings("unchecked")
                    Map<String, Object> m = (Map<String, Object>) o;
                    out.add(m);
                }
            }
            return out;
        }
        return Collections.emptyList();
    }

    private List<String> toStringList(Object obj) {
        if (obj instanceof List<?>) {
            List<?> raw = (List<?>) obj;
            List<String> out = new ArrayList<>();
            for (Object o : raw) {
                if (o != null) out.add(o.toString());
            }
            return out;
        }
        return Collections.emptyList();
    }

    private void createStubBankData(User user) {
        BankAccount acct = new BankAccount();
        acct.setUser(user);
        acct.setProvider("plaid");
        acct.setProviderAccountId(UUID.randomUUID().toString());
        acct.setName("Plaid Checking (Sandbox)");
        acct.setMask("1234");
        acct.setType("depository");
        acct.setAccessToken("placeholder-access-token");
        bankAccountRepository.save(acct);

        BankTransaction t1 = new BankTransaction();
        t1.setUser(user);
        t1.setBankAccount(acct);
        t1.setDescription("Grocery Store");
        t1.setAmount(-54.32);
        t1.setTransactionDate(LocalDate.now().minusDays(3));
        t1.setCategory("Groceries");
        bankTransactionRepository.save(t1);

        BankTransaction t2 = new BankTransaction();
        t2.setUser(user);
        t2.setBankAccount(acct);
        t2.setDescription("Salary");
        t2.setAmount(2500.00);
        t2.setTransactionDate(LocalDate.now().minusDays(10));
        t2.setCategory("Income");
        bankTransactionRepository.save(t2);
    }
}
