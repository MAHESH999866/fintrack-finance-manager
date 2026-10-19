package com.fintrack.security;

import com.fintrack.entity.User;
import com.fintrack.enums.AccountStatus;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.Collection;
import java.util.Collections;

public class UserPrincipal implements UserDetails {

    private final Long id;
    private final String fullName;
    private final String email;
    private final String password;
    private final AccountStatus accountStatus;
    private final Collection<? extends GrantedAuthority> authorities;

    public UserPrincipal(Long id, String fullName, String email, String password, AccountStatus accountStatus, Collection<? extends GrantedAuthority> authorities) {
        this.id = id;
        this.fullName = fullName;
        this.email = email;
        this.password = password;
        this.accountStatus = accountStatus;
        this.authorities = authorities;
    }

    public static UserPrincipal create(User user) {
        Collection<GrantedAuthority> authorities = Collections.singletonList(new SimpleGrantedAuthority("ROLE_USER"));
        return new UserPrincipal(
            user.getId(),
            user.getFullName(),
            user.getEmail(),
            user.getPasswordHash(),
            user.getAccountStatus(),
            authorities
        );
    }

    public Long getId() {
        return id;
    }

    public String getFullName() {
        return fullName;
    }

    public String getEmail() {
        return email;
    }

    @Override
    public String getUsername() {
        return email;
    }

    @Override
    public String getPassword() {
        return password;
    }

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return authorities;
    }

    @Override
    public boolean isAccountNonExpired() {
        return true;
    }

    @Override
    public boolean isAccountNonLocked() {
        return accountStatus != AccountStatus.SUSPENDED;
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return true;
    }

    @Override
    public boolean isEnabled() {
        return accountStatus == AccountStatus.ACTIVE;
    }
}
