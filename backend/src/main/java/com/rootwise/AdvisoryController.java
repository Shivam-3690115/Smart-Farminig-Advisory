package com.rootwise;

import java.util.List;
import java.util.Map;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api")
public class AdvisoryController {
    private final FarmerAccountRepository accounts;

    public AdvisoryController(FarmerAccountRepository accounts) {
        this.accounts = accounts;
    }

    @GetMapping("/dashboard")
    public ResponseEntity<?> dashboard(@RequestParam String email) {
        return accounts.findByEmailIgnoreCase(email.trim())
            .map(account -> ResponseEntity.ok(Map.of(
                "farmer", Map.of("id", account.getId(), "name", account.getName(),
                    "farmName", account.getFarmLocation() == null ? "" : account.getFarmLocation(),
                    "location", account.getFarmLocation() == null ? "" : account.getFarmLocation(),
                    "acres", account.getAcres() == null ? 0 : account.getAcres(),
                    "preferredLanguage", account.getPreferredLanguage() == null ? "English" : account.getPreferredLanguage()),
                "summary", Map.of("activeCrops", 0, "openAdvisories", 0),
                "crops", List.of(),
                "advisories", List.of(),
                "tasks", List.of()
            )))
            .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @GetMapping("/advisories")
    public List<Map<String, String>> advisories() {
        return List.of();
    }

    @PostMapping("/tasks")
    public ResponseEntity<Map<String, String>> createTask(@RequestBody Map<String, String> task) {
        String title = task.getOrDefault("title", "").trim();
        if (title.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Task title is required"));
        }
        return ResponseEntity.ok(Map.of("status", "created", "title", title));
    }
}