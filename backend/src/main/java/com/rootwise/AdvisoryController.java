package com.rootwise;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api")
public class AdvisoryController {
    @GetMapping("/dashboard")
    public ResponseEntity<Map<String, Object>> dashboard() {
        return ResponseEntity.ok(Map.of(
            "farmer", Map.of("name", "Shivam Gaikwad", "farmName", "Green Valley Farm", "location", "Nashik, Maharashtra"),
            "summary", Map.of("activeCrops", 4, "soilMoisture", 68, "waterSavedLitres", 2840, "openAdvisories", 3),
            "crops", List.of(
                Map.of("name", "Tomato", "variety", "Arka Rakshak", "stage", "Flowering", "daysAfterSowing", 42),
                Map.of("name", "Onion", "variety", "N-53", "stage", "Bulbing", "daysAfterSowing", 68)
            ),
            "updatedAt", LocalDate.now().toString()
        ));
    }

    @GetMapping("/advisories")
    public List<Map<String, String>> advisories() {
        return List.of(
            Map.of("title", "Rain expected in 2 days", "category", "Water smart", "priority", "LOW"),
            Map.of("title", "Early blight risk is rising", "category", "Crop health", "priority", "HIGH"),
            Map.of("title", "Best time to fertilize", "category", "Nutrition", "priority", "MEDIUM")
        );
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