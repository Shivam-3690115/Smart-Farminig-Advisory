package com.rootwise;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.io.IOException;
import java.net.URI;
import java.net.URLEncoder;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/integrations")
public class ExternalIntegrationController {
    private final ObjectMapper objectMapper;
    private final HttpClient httpClient = HttpClient.newHttpClient();
    private final String weatherKey;
    private final String weatherBaseUrl;
    private final String openAiKey;
    private final String openAiBaseUrl;
    private final String openAiModel;

    public ExternalIntegrationController(
        ObjectMapper objectMapper,
        @Value("${integrations.weather.api-key}") String weatherKey,
        @Value("${integrations.weather.base-url}") String weatherBaseUrl,
        @Value("${integrations.openai.api-key}") String openAiKey,
        @Value("${integrations.openai.base-url}") String openAiBaseUrl,
        @Value("${integrations.openai.model}") String openAiModel
    ) {
        this.objectMapper = objectMapper;
        this.weatherKey = weatherKey;
        this.weatherBaseUrl = weatherBaseUrl;
        this.openAiKey = openAiKey;
        this.openAiBaseUrl = openAiBaseUrl;
        this.openAiModel = openAiModel;
    }

    @GetMapping("/weather")
    public ResponseEntity<?> weather(@RequestParam(defaultValue = "Nashik, Maharashtra") String location) {
        if (weatherKey.isBlank()) {
            return configurationError("OPENWEATHER_API_KEY is not configured.");
        }
        try {
            String url = weatherBaseUrl + "/forecast?q=" + encode(location) + "&appid=" + encode(weatherKey)
                + "&units=metric&cnt=40";
            JsonNode source = requestJson(url, null, null);
            JsonNode first = source.path("list").path(0);
            List<Map<String, Object>> forecast = new ArrayList<>();
            for (JsonNode item : source.path("list")) {
                if (forecast.size() >= 5) break;
                Map<String, Object> day = new HashMap<>();
                day.put("day", item.path("dt_txt").asText().replace('T', ' '));
                day.put("temp", Math.round(item.path("main").path("temp").asDouble()));
                day.put("rain", Math.round(item.path("pop").asDouble() * 100));
                day.put("wind", Math.round(item.path("wind").path("speed").asDouble() * 3.6));
                forecast.add(day);
            }
            return ResponseEntity.ok(Map.of(
                "city", source.path("city").path("name").asText(location),
                "temp", Math.round(first.path("main").path("temp").asDouble()),
                "humidity", first.path("main").path("humidity").asInt(),
                "wind", Math.round(first.path("wind").path("speed").asDouble() * 3.6),
                "rain", Math.round(first.path("pop").asDouble() * 100),
                "forecast", forecast
            ));
        } catch (ExternalApiException exception) {
            return ResponseEntity.status(exception.status).body(Map.of("error", exception.getMessage()));
        }
    }

    @PostMapping("/plant-advice")
    public ResponseEntity<?> plantAdvice(@RequestBody PlantAdviceRequest request) {
        if (openAiKey.isBlank()) {
            return configurationError("OPENAI_API_KEY is not configured.");
        }
        String symptoms = request.symptoms() == null ? "" : request.symptoms().trim();
        if (symptoms.isBlank() && (request.imageDataUrl() == null || request.imageDataUrl().isBlank())) {
            return ResponseEntity.badRequest().body(Map.of("error", "Symptoms or an image is required."));
        }
        try {
            String prompt = "You are a cautious agricultural advisory assistant. Analyze the crop symptoms. "
                + "Return concise plain text with: likely issue, immediate safe actions, organic/biological options, "
                + "chemical caution, and when to contact an agronomist. Never invent a guaranteed diagnosis or dosage. "
                + "Symptoms: " + symptoms;
            List<Map<String, Object>> content = new ArrayList<>();
            content.add(Map.of("type", "input_text", "text", prompt));
            if (request.imageDataUrl() != null && !request.imageDataUrl().isBlank()) {
                content.add(Map.of("type", "input_image", "image_url", request.imageDataUrl()));
            }
            Map<String, Object> payload = Map.of("model", openAiModel, "input",
                List.of(Map.of("role", "user", "content", content)), "store", false);
            JsonNode response = requestJson(openAiBaseUrl + "/responses", objectMapper.writeValueAsString(payload), openAiKey);
            String answer = responseText(response);
            if (answer.isBlank()) throw new ExternalApiException(HttpStatus.BAD_GATEWAY.value(), "AI returned no advice.");
            return ResponseEntity.ok(Map.of("answer", answer));
        } catch (ExternalApiException exception) {
            return ResponseEntity.status(exception.status).body(Map.of("error", exception.getMessage()));
        } catch (IOException exception) {
            return ResponseEntity.status(HttpStatus.BAD_GATEWAY).body(Map.of("error", "Unable to prepare the AI request."));
        }
    }

    @PostMapping("/chat")
    public ResponseEntity<?> chat(@RequestBody ChatRequest request) {
        if (openAiKey.isBlank()) return configurationError("OPENAI_API_KEY is not configured.");
        if (request.question() == null || request.question().isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Question is required."));
        }

        try {
            Map<String, Object> payload = Map.of(
                "model", openAiModel,
                "instructions", "You are Kisan Mitra, a cautious farming support assistant. Give concise, practical answers. Tell the farmer to consult a local agriculture officer before pesticide use.",
                "input", request.question(),
                "store", true
            );
            JsonNode response = requestJson(openAiBaseUrl + "/responses", objectMapper.writeValueAsString(payload), openAiKey);
            String answer = responseText(response);
            if (answer.isBlank()) throw new ExternalApiException(HttpStatus.BAD_GATEWAY.value(), "AI returned no answer.");
            return ResponseEntity.ok(Map.of("answer", answer));
        } catch (ExternalApiException exception) {
            return ResponseEntity.status(exception.status).body(Map.of("error", exception.getMessage()));
        } catch (IOException exception) {
            return ResponseEntity.status(HttpStatus.BAD_GATEWAY).body(Map.of("error", "Unable to prepare the AI request."));
        }
    }

    @PostMapping("/farm-analysis")
    public ResponseEntity<?> farmAnalysis(@RequestBody FarmAnalysisRequest request) {
        if (openAiKey.isBlank()) return configurationError("OPENAI_API_KEY is not configured.");
        if (request.query() == null || request.query().isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Analysis input is required."));
        }
        try {
            String context = request.context() == null ? "" : request.context();
            String prompt = "You are a cautious agricultural analyst. Use only the farmer data supplied below. "
                + "Do not invent measurements, prices, products, contacts, or dates. Return practical advice with "
                + "clear headings, assumptions, and a warning to verify regulated inputs locally. Task: "
                + request.query() + "\nFarmer data: " + context;
            Map<String, Object> payload = Map.of(
                "model", openAiModel,
                "instructions", "You are Kisan Mitra. Never present demo or fabricated data as fact.",
                "input", prompt,
                "store", true
            );
            JsonNode response = requestJson(openAiBaseUrl + "/responses", objectMapper.writeValueAsString(payload), openAiKey);
            String answer = responseText(response);
            if (answer.isBlank()) throw new ExternalApiException(HttpStatus.BAD_GATEWAY.value(), "AI returned no analysis.");
            return ResponseEntity.ok(Map.of("answer", answer));
        } catch (ExternalApiException exception) {
            return ResponseEntity.status(exception.status).body(Map.of("error", exception.getMessage()));
        } catch (IOException exception) {
            return ResponseEntity.status(HttpStatus.BAD_GATEWAY).body(Map.of("error", "Unable to prepare the AI request."));
        }
    }

    private JsonNode requestJson(String url, String body, String bearerToken) {
        try {
            HttpRequest.Builder builder = HttpRequest.newBuilder(URI.create(url))
                .header("Accept", "application/json");
            if (body == null) builder.GET();
            else builder.header("Content-Type", "application/json").header("Authorization", "Bearer " + bearerToken)
                .POST(HttpRequest.BodyPublishers.ofString(body));
            HttpResponse<String> response = httpClient.send(builder.build(), HttpResponse.BodyHandlers.ofString());
            if (response.statusCode() < 200 || response.statusCode() >= 300) {
                throw new ExternalApiException(response.statusCode(), providerErrorMessage(response.body()));
            }
            return objectMapper.readTree(response.body());
        } catch (IOException exception) {
            throw new ExternalApiException(HttpStatus.BAD_GATEWAY.value(), "External service could not be reached.");
        } catch (InterruptedException exception) {
            Thread.currentThread().interrupt();
            throw new ExternalApiException(HttpStatus.BAD_GATEWAY.value(), "External service request was interrupted.");
        }

    }

    private String providerErrorMessage(String responseBody) {
        try {
            JsonNode error = objectMapper.readTree(responseBody).path("error");
            String message = error.path("message").asText("");
            if (!message.isBlank()) {
                return "AI provider error: " + message;
            }
        } catch (IOException ignored) {
            // Keep the response generic when the provider does not return JSON.
        }
        return "External service rejected the request.";
    }

    private String responseText(JsonNode response) {
        String outputText = response.path("output_text").asText("");
        if (!outputText.isBlank()) return outputText;

        StringBuilder text = new StringBuilder();
        for (JsonNode outputItem : response.path("output")) {
            for (JsonNode contentItem : outputItem.path("content")) {
                String value = contentItem.path("text").asText("");
                if (!value.isBlank()) {
                    if (text.length() > 0) text.append('\n');
                    text.append(value);
                }
            }
        }
        return text.toString().trim();
    }

    private ResponseEntity<Map<String, String>> configurationError(String message) {
        return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE).body(Map.of("error", message));
    }

    private String encode(String value) {
        return URLEncoder.encode(value, StandardCharsets.UTF_8);
    }

    public record PlantAdviceRequest(String symptoms, String imageDataUrl) {}
    public record ChatRequest(String question) {}
    public record FarmAnalysisRequest(String query, String context) {}
    private static final class ExternalApiException extends RuntimeException {
        private final int status;
        private ExternalApiException(int status, String message) { super(message); this.status = status; }
    }
}
