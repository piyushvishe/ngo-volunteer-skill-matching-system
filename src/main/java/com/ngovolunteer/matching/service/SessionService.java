package com.ngovolunteer.matching.service;

import jakarta.servlet.http.HttpSession;
import org.springframework.stereotype.Service;

@Service
public class SessionService {

    public Long getLoggedInUserId(HttpSession session) {
        return (Long) session.getAttribute("userId");
    }

    public boolean isLoggedIn(HttpSession session) {
        return session.getAttribute("userId") != null;
    }

    public String getLoggedInUserRole(HttpSession session) {
        return (String) session.getAttribute("userRole");
    }

    public boolean hasRole(HttpSession session, String role) {
        return role.equalsIgnoreCase(
                getLoggedInUserRole(session)
        );
    }
}