package com.rootwise;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import java.util.Locale;
import java.util.Map;
import java.util.UUID;
import java.time.Duration;
import java.time.Instant;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.PutMapping;

@RestController
@RequestMapping("/api/auth")
public class AuthController {
    private final FarmerAccountRepository accounts;
    private final PasswordEncoder passwordEncoder;

    public AuthController(FarmerAccountRepository accounts, PasswordEncoder passwordEncoder) {
        this.accounts = accounts;
        this.passwordEncoder = passwordEncoder;
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@Valid @RequestBody RegistrationRequest request) {
        String email = request.email().trim().toLowerCase(Locale.ROOT);
        if (accounts.existsByEmailIgnoreCase(email)) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                .body(Map.of("error", "An account with this email already exists."));
        }
        FarmerAccount account = accounts.save(new FarmerAccount(
            request.name().trim(),
            email,
            passwordEncoder.encode(request.password()), request.residentialAddress(), request.acres(), request.farmLocation(),
            request.farmingType(), request.landType(), request.preferredLanguage()
        ));
        return ResponseEntity.status(HttpStatus.CREATED).body(accountResponse(account));
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@Valid @RequestBody LoginRequest request) {
        return accounts.findByEmailIgnoreCase(request.email().trim())
            .filter(account -> passwordEncoder.matches(request.password(), account.getPasswordHash()))
            .<ResponseEntity<?>>map(account -> ResponseEntity.ok(accountResponse(account)))
            .orElseGet(() -> ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body(Map.of("error", "Invalid email or password.")));
    }

    @PostMapping("/request-password-reset")
    public ResponseEntity<?> requestPasswordReset(@Valid @RequestBody PasswordResetRequest request) {
        return accounts.findByEmailIgnoreCase(request.email().trim())
            .map(account -> {
                String token = UUID.randomUUID().toString();
                account.setPasswordResetToken(token);
                account.setPasswordResetExpiresAt(Instant.now().plus(Duration.ofMinutes(30)));
                accounts.save(account);
                return ResponseEntity.ok(Map.of(
                    "message", "If the account exists, a reset link has been prepared.",
                    "resetToken", token
                ));
            })
            .orElseGet(() -> ResponseEntity.ok(Map.of("message", "If the account exists, a reset link has been prepared.")));
    }

    @PostMapping("/reset-password")
    public ResponseEntity<?> resetPassword(@Valid @RequestBody ResetPasswordRequest request) {
        return accounts.findByPasswordResetToken(request.token().trim())
            .filter(account -> account.getPasswordResetExpiresAt() != null
                && account.getPasswordResetExpiresAt().isAfter(Instant.now()))
            .map(account -> {
                account.setPasswordHash(passwordEncoder.encode(request.password()));
                account.setPasswordResetToken(null);
                account.setPasswordResetExpiresAt(null);
                accounts.save(account);
                return ResponseEntity.ok(Map.of("message", "Password reset successfully. You can now sign in."));
            })
            .orElseGet(() -> ResponseEntity.badRequest().body(Map.of("error", "This reset token is invalid or expired.")));
    }

    @PutMapping("/profile")
    public ResponseEntity<?> updateProfile(@Valid @RequestBody ProfileUpdateRequest request) {
        return accounts.findByEmailIgnoreCase(request.email().trim())
            .map(account -> {
                account.updateProfile(request.name().trim(), request.farmLocation().trim(), request.preferredLanguage());
                accounts.save(account);
                return ResponseEntity.ok(accountResponse(account));
            })
            .orElseGet(() -> ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", "Farmer account was not found.")));
    }

    private Map<String, Object> accountResponse(FarmerAccount account) {
        return Map.of(
            "token", UUID.randomUUID().toString(),
            "farmer", Map.of("id", account.getId(), "name", account.getName(), "email", account.getEmail(),
                "farmName", account.getFarmLocation() == null ? "Set up your farm" : account.getFarmLocation(),
                "location", account.getFarmLocation() == null ? "Not set" : account.getFarmLocation(),
                "acres", account.getAcres() == null ? 0 : account.getAcres(),
                "farmingType", account.getFarmingType() == null ? "Not set" : account.getFarmingType(),
                "landType", account.getLandType() == null ? "Not set" : account.getLandType(),
                "preferredLanguage", account.getPreferredLanguage() == null ? "English" : account.getPreferredLanguage())
        );
    }

    public record RegistrationRequest(
        @NotBlank @Size(min = 2, max = 100) String name,
        @NotBlank @Email @Size(max = 190) String email,
        @NotBlank @Size(min = 8, max = 72) String password,
        @NotBlank String residentialAddress,
        @jakarta.validation.constraints.NotNull Double acres,
        @NotBlank String farmLocation,
        @NotBlank String farmingType,
        @NotBlank String landType,
        @NotBlank String preferredLanguage
    ) {}

    public record LoginRequest(
        @NotBlank @Email @Size(max = 190) String email,
        @NotBlank @Size(min = 8, max = 72) String password
    ) {}

    public record PasswordResetRequest(@NotBlank @Email @Size(max = 190) String email) {}

    public record ResetPasswordRequest(
        @NotBlank String token,
        @NotBlank @Size(min = 8, max = 72) String password
    ) {}

    public record ProfileUpdateRequest(
        @NotBlank @Size(min = 2, max = 100) String name,
        @NotBlank String farmLocation,
        @NotBlank String preferredLanguage,
        @NotBlank @Email @Size(max = 190) String email
    ) {}
}
