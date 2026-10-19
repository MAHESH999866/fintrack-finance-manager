package com.fintrack.entity;

import com.fintrack.enums.MessageRole;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.Instant;
import java.util.Objects;

/**
 * An individual message within a financial chatbot conversation.
 * Role can be USER, ASSISTANT, or SYSTEM.
 * Never stores API keys or authentication credentials.
 */
@Entity
@Table(
    name = "chatbot_messages",
    indexes = {
        @Index(name = "idx_chatbot_msg_conv_time", columnList = "conversation_id, created_at ASC")
    }
)
@EntityListeners(AuditingEntityListener.class)
public class ChatbotMessage {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotNull
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "conversation_id", nullable = false, foreignKey = @ForeignKey(name = "fk_chatbot_msg_conv"))
    private ChatbotConversation conversation;

    @NotNull
    @Enumerated(EnumType.STRING)
    @Column(name = "role", nullable = false, length = 15)
    private MessageRole role;

    @NotBlank
    @Column(name = "content", nullable = false, columnDefinition = "TEXT")
    private String content;

    @Column(name = "metadata_json", columnDefinition = "JSON")
    private String metadataJson;

    @CreatedDate
    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt = Instant.now();

    public ChatbotMessage() {
    }

    public ChatbotMessage(ChatbotConversation conversation, MessageRole role, String content, String metadataJson) {
        this.conversation = conversation;
        this.role = role;
        this.content = content;
        this.metadataJson = metadataJson;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public ChatbotConversation getConversation() {
        return conversation;
    }

    public void setConversation(ChatbotConversation conversation) {
        this.conversation = conversation;
    }

    public MessageRole getRole() {
        return role;
    }

    public void setRole(MessageRole role) {
        this.role = role;
    }

    public String getContent() {
        return content;
    }

    public void setContent(String content) {
        this.content = content;
    }

    public String getMetadataJson() {
        return metadataJson;
    }

    public void setMetadataJson(String metadataJson) {
        this.metadataJson = metadataJson;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Instant createdAt) {
        this.createdAt = createdAt;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof ChatbotMessage that)) return false;
        return Objects.equals(id, that.id);
    }

    @Override
    public int hashCode() {
        return Objects.hash(id);
    }
}
