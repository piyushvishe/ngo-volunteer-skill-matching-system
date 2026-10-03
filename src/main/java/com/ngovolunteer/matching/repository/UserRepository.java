package com.ngovolunteer.matching.repository;

import com.ngovolunteer.matching.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

public interface UserRepository extends JpaRepository<User, Long> {
}