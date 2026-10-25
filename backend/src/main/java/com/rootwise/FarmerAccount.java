package com.rootwise;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.time.Instant;

@Entity
@Table(name = "farmer_accounts")
public class FarmerAccount {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false, unique = true, length = 190)
    private String email;

    @Column(nullable = false)
    private String passwordHash;

    @Column(nullable = false)
    private Instant createdAt;
    private String residentialAddress;
    private Double acres;
    private String farmLocation;
    private String farmingType;
    private String landType;
    private String preferredLanguage;
    private String passwordResetToken;
    private Instant passwordResetExpiresAt;

    protected FarmerAccount() {
    }

    public FarmerAccount(String name, String email, String passwordHash, String residentialAddress, Double acres, String farmLocation, String farmingType, String landType, String preferredLanguage) {
        this.name = name;
        this.email = email;
        this.passwordHash = passwordHash;
        this.createdAt = Instant.now();
        this.residentialAddress = residentialAddress;
        this.acres = acres;
        this.farmLocation = farmLocation;
        this.farmingType = farmingType;
        this.landType = landType;
        this.preferredLanguage = preferredLanguage;
    }

    public Long getId() {
        return id;
    }

    public String getName() {
        return name;
    }

    public String getEmail() {
        return email;
    }

    public String getPasswordHash() {
        return passwordHash;
    }

    public String getResidentialAddress() { return residentialAddress; }
    public Double getAcres() { return acres; }
    public String getFarmLocation() { return farmLocation; }
    public String getFarmingType() { return farmingType; }
    public String getLandType() { return landType; }
    public String getPreferredLanguage() { return preferredLanguage; }
    public String getPasswordResetToken() { return passwordResetToken; }
    public Instant getPasswordResetExpiresAt() { return passwordResetExpiresAt; }
    public void setPasswordResetToken(String passwordResetToken) { this.passwordResetToken = passwordResetToken; }
    public void setPasswordResetExpiresAt(Instant passwordResetExpiresAt) { this.passwordResetExpiresAt = passwordResetExpiresAt; }
    public void setPasswordHash(String passwordHash) { this.passwordHash = passwordHash; }
}
