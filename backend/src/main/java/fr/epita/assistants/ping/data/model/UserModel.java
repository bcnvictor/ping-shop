package fr.epita.assistants.ping.data.model;

import static fr.epita.assistants.ping.utils.Format.generateDisplayNameFromLogin;
import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import lombok.*;

import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.UUID;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Entity
@With
@Table(name = "users")
public class UserModel {
    /// DONE

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    public UUID id;

    @Column(name = "avatar")
    public String avatar = "";

    @Column(name = "display_name")
    public String displayName;

    @Column(name="is_admin")
    public Boolean isAdmin = false;

    @Column(name = "login", nullable = false, unique = true)
    @Pattern(regexp = "^[^._]+[._][^._]+$",
            message = "Login must be in format 'part1.part2' or 'part1_part2'")
    public String login;

    @Column(name = "password")
    public String password;

    @ManyToMany(mappedBy = "members", fetch = FetchType.LAZY)
    public Set<ProjectModel> memberProjects = new HashSet<>();

    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<OrderModel> orders;

    @OneToMany(mappedBy = "seller", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<OrderModel> sales;

    @PrePersist
    @PreUpdate
    public void setDisplayName() {
        if (displayName == null || displayName.isEmpty()) {
            displayName = generateDisplayNameFromLogin(login);
        }
    }

}