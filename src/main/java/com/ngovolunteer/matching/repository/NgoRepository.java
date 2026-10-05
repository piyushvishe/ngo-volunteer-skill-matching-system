package com.ngovolunteer.matching.repository;

import com.ngovolunteer.matching.entity.Ngo;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface NgoRepository extends JpaRepository<Ngo, Long> {

    Optional<Ngo> findByUserId(Long userId);
}