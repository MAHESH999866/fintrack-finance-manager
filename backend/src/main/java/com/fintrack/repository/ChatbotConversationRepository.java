package com.fintrack.repository;

import com.fintrack.entity.ChatbotConversation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ChatbotConversationRepository extends JpaRepository<ChatbotConversation, Long> {

    List<ChatbotConversation> findByUserIdOrderByUpdatedAtDesc(Long userId);

    Optional<ChatbotConversation> findByIdAndUserId(Long id, Long userId);

    void deleteByIdAndUserId(Long id, Long userId);
}
