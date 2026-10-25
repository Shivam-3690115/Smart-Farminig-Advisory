package com.rootwise;

import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface FarmerAccountRepository extends JpaRepository<FarmerAccount, Long> {
    Optional<FarmerAccount> findByEmailIgnoreCase(String email);
    Optional<FarmerAccount> findByPasswordResetToken(String passwordResetToken);
    boolean existsByEmailIgnoreCase(String email);
}
