package com.ngovolunteer.matching;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.mock.web.MockHttpSession;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.options;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest(properties = {
        "spring.datasource.url=jdbc:h2:mem:csrf-test;DB_CLOSE_DELAY=-1",
        "spring.datasource.driver-class-name=org.h2.Driver",
        "spring.datasource.username=sa",
        "spring.datasource.password=",
        "spring.jpa.hibernate.ddl-auto=create-drop"
})
@AutoConfigureMockMvc
class NgoVolunteerSkillMatchingSystemApplicationTests {

    @Autowired
    private MockMvc mockMvc;

    @Test
    void contextLoads() {
    }

    @Test
    void stateChangingRequestsRequireSessionCsrfToken() throws Exception {
        MvcResult tokenResult = mockMvc.perform(get("/api/auth/csrf"))
                .andExpect(status().isOk())
                .andReturn();

        String tokenResponse = tokenResult.getResponse().getContentAsString();
        java.util.regex.Matcher tokenMatcher = java.util.regex.Pattern
                .compile("\\\"token\\\":\\\"([^\\\"]+)\\\"")
                .matcher(tokenResponse);
        org.junit.jupiter.api.Assertions.assertTrue(tokenMatcher.find(), "CSRF response includes a token");
        String token = tokenMatcher.group(1);
        MockHttpSession session = (MockHttpSession) tokenResult.getRequest().getSession(false);

        mockMvc.perform(post("/api/auth/logout").session(session))
                .andExpect(status().isForbidden());

        mockMvc.perform(post("/api/auth/logout").session(session).header("X-CSRF-TOKEN", token))
                .andExpect(status().isOk());
    }

    @Test
    void frontendOriginCanSendCsrfHeader() throws Exception {
        MvcResult result = mockMvc.perform(options("/api/auth/register")
                        .header("Origin", "http://localhost:5173")
                        .header("Access-Control-Request-Method", "POST")
                        .header("Access-Control-Request-Headers", "content-type,x-csrf-token"))
                .andExpect(status().isOk())
                .andReturn();

        org.junit.jupiter.api.Assertions.assertEquals(
                "http://localhost:5173",
                result.getResponse().getHeader("Access-Control-Allow-Origin"));
        org.junit.jupiter.api.Assertions.assertTrue(
                result.getResponse().getHeader("Access-Control-Allow-Headers").toLowerCase().contains("x-csrf-token"));
    }
}
