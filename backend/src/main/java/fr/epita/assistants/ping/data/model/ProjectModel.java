package fr.epita.assistants.ping.data.model;

import jakarta.persistence.*;
import lombok.*;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;


@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Entity
@With
@Table(name = "projects")
public class ProjectModel {
    /// DONE

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    public UUID id;

    @Column(name = "name")
    public String name;

    @Column(name = "path")
    public String path;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "owner_id", nullable = false)
    public UserModel owner;

    @ManyToMany(fetch = FetchType.LAZY)
    @JoinTable(
            name = "project_members",
            joinColumns = @JoinColumn(name = "project_id"),
            inverseJoinColumns = @JoinColumn(name = "user_id"),
            uniqueConstraints = @UniqueConstraint(columnNames = {"project_id", "user_id"})
    )
    public List<UserModel> members = new ArrayList<>();
}
