package com.ngovolunteer.matching.repository;

import com.ngovolunteer.matching.entity.Ngo;
import org.springframework.data.jpa.repository.JpaRepository;

public interface NgoRepository extends JpaRepository<Ngo, Long> {
}