package com.fintrack.repository;

import com.fintrack.entity.ChatbotMessage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ChatbotMessageRepository extends JpaRepository<ChatbotMessage, Long> {

    List<ChatbotMessage> findByConversationIdOrderByCreatedAtAsc(Long conversationId);

    long countByConversationId(Long conversationId);
}
