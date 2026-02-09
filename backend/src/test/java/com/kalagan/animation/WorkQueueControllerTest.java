package com.kalagan.animation;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.kalagan.animation.web.AssignRequest;
import com.kalagan.animation.web.WorkItemRequest;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.TestPropertySource;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@TestPropertySource(properties = {
        "spring.datasource.url=jdbc:sqlite:file:target/test.db",
        "spring.datasource.driver-class-name=org.sqlite.JDBC",
        "spring.jpa.hibernate.ddl-auto=create-drop",
        "spring.jpa.database-platform=org.hibernate.community.dialect.SQLiteDialect"
})
class WorkQueueControllerTest {
    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    void createAssignCompleteFlow() throws Exception {
        WorkItemRequest create = new WorkItemRequest();
        create.setTitle("Prospection client A");
        create.setSupervisor("Sarah");

        String created = mockMvc.perform(post("/api/work-items")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(create)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("NEW"))
                .andReturn()
                .getResponse()
                .getContentAsString();

        Long id = objectMapper.readTree(created).get("id").asLong();

        AssignRequest assign = new AssignRequest();
        assign.setAgent("Agent-1");

        mockMvc.perform(post("/api/work-items/" + id + "/assign")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(assign)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("ASSIGNED"))
                .andExpect(jsonPath("$.assignedTo").value("Agent-1"));

        mockMvc.perform(post("/api/work-items/" + id + "/complete")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(assign)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("COMPLETED"));

        mockMvc.perform(get("/api/audit"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].actionType").value("COMPLETE"));
    }
}
