package com.example.expensetracker.service;

import com.example.expensetracker.model.dto.InvoiceDto;
import com.example.expensetracker.model.entity.Invoice;
import com.example.expensetracker.model.entity.User;
import com.example.expensetracker.repository.InvoiceRepository;
import com.example.expensetracker.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class InvoiceService {

    private final InvoiceRepository invoiceRepository;
    private final UserRepository userRepository;

    public InvoiceService(InvoiceRepository invoiceRepository, UserRepository userRepository) {
        this.invoiceRepository = invoiceRepository;
        this.userRepository = userRepository;
    }

    public List<InvoiceDto> list(String userEmail) {
        User user = userRepository.findByEmail(userEmail).orElseThrow();
        return invoiceRepository.findByUserId(user.getId()).stream().map(this::toDto).collect(Collectors.toList());
    }

    public InvoiceDto create(String userEmail, InvoiceDto dto) {
        User user = userRepository.findByEmail(userEmail).orElseThrow();
        Invoice invoice = new Invoice();
        invoice.setUser(user);
        invoice.setClientName(dto.getClientName());
        invoice.setClientEmail(dto.getClientEmail());
        invoice.setAmount(dto.getAmount());
        invoice.setDueDate(LocalDate.parse(dto.getDueDate()));
        invoice.setStatus(dto.getStatus() == null ? "Pending" : dto.getStatus());
        invoice.setDescription(dto.getDescription());
        return toDto(invoiceRepository.save(invoice));
    }

    private InvoiceDto toDto(Invoice invoice) {
        InvoiceDto dto = new InvoiceDto();
        dto.setId(invoice.getId());
        dto.setClientName(invoice.getClientName());
        dto.setClientEmail(invoice.getClientEmail());
        dto.setAmount(invoice.getAmount());
        dto.setDueDate(invoice.getDueDate() != null ? invoice.getDueDate().toString() : null);
        dto.setStatus(invoice.getStatus());
        dto.setDescription(invoice.getDescription());
        return dto;
    }
}
