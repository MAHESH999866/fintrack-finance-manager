package com.fintrack.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.util.ArrayList;
import java.util.List;
import java.util.Objects;

/**
 * Chatbot advisory session container.
 * Completely decoupled from financial transaction data for privacy and security.
 */
@Entity
@Table(
    name = "chatbot_conversations",
    indexes = {
        @Index(name = "idx_chatbot_conv_user", columnList = "user_id, updated_at DESC")
    }
)
public class ChatbotConversation extends BaseAuditableEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotNull
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false, foreignKey = @ForeignKey(name = "fk_chatbot_conv_user"))
    private User user;

    @NotBlank
    @Size(max = 150)
    @Column(name = "title", nullable = false, length = 150)
    private String title = "Financial Advisory Session";

    @OneToMany(mappedBy = "conversation", cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("createdAt ASC")
    private List<ChatbotMessage> messages = new ArrayList<>();

    public ChatbotConversation() {
    }

    public ChatbotConversation(User user, String title) {
        this.user = user;
        this.title = title != null ? title : "Financial Advisory Session";
    }

    public void addMessage(ChatbotMessage message) {
        messages.add(message);
        message.setConversation(this);
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public List<ChatbotMessage> getMessages() {
        return messages;
    }

    public void setMessages(List<ChatbotMessage> messages) {
        this.messages = messages;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof ChatbotConversation that)) return false;
        return Objects.equals(id, that.id);
    }

    @Override
    public int hashCode() {
        return Objects.hash(id);
    }
}
