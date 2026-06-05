package com.example.expensetracker.controller;

import com.example.expensetracker.model.dto.InvoiceDto;
import com.example.expensetracker.service.InvoiceService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/invoices")
public class InvoiceController {

    private final InvoiceService invoiceService;

    public InvoiceController(InvoiceService invoiceService) {
        this.invoiceService = invoiceService;
    }

    @GetMapping
    public ResponseEntity<List<InvoiceDto>> list(@AuthenticationPrincipal UserDetails user) {
        return ResponseEntity.ok(invoiceService.list(user.getUsername()));
    }

    @PostMapping
    public ResponseEntity<InvoiceDto> create(@AuthenticationPrincipal UserDetails user,
                                             @RequestBody InvoiceDto dto) {
        return ResponseEntity.ok(invoiceService.create(user.getUsername(), dto));
    }
}
