package com.example.expensetracker.util;

import org.jsoup.Jsoup;
import org.jsoup.safety.Safelist;

public final class InputSanitizer {

    private InputSanitizer() {}

    public static String sanitize(String input) {
        if (input == null) return null;
        // Use a relaxed safelist that removes scripts and inline event handlers
        return Jsoup.clean(input, Safelist.relaxed());
    }
}
