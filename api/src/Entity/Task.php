<?php

namespace App\Entity;

use ApiPlatform\Metadata\ApiResource;
use ApiPlatform\Metadata\Delete;
use ApiPlatform\Metadata\Get;
use ApiPlatform\Metadata\GetCollection;
use ApiPlatform\Metadata\Patch;
use ApiPlatform\Metadata\Post;
use App\Repository\TaskRepository;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Serializer\Attribute\Groups;
use Symfony\Component\Validator\Constraints as Assert;

#[ORM\Entity(repositoryClass: TaskRepository::class)]
#[ApiResource(
    operations: [
        new GetCollection(
            uriTemplate: '/tasks',
            normalizationContext: ['groups' => ['task:read']],
        ),
        new Get(
            uriTemplate: '/tasks/{id}',
            normalizationContext: ['groups' => ['task:read']],
        ),
        new Post(
            uriTemplate: '/tasks',
            normalizationContext: ['groups' => ['task:read']],
            denormalizationContext: ['groups' => ['task:write']],
        ),
        new Patch(
            uriTemplate: '/tasks/{id}',
            normalizationContext: ['groups' => ['task:read']],
            denormalizationContext: ['groups' => ['task:write']],
        ),
        new Delete(
            uriTemplate: '/tasks/{id}',
        )
    ]
)]
class Task
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    #[Groups(['task:read'])]
    private ?int $id = null;

    #[ORM\Column(length: 150)]
    #[Assert\NotBlank(message: 'Task cannot be empty.')]
    #[Assert\Length(
        max: 150,
        maxMessage: 'Task name cannot be longer than 150 characters.',
    )]
    #[Groups(['task:read'])]
    private ?string $name = null;

    #[ORM\Column]
    #[Assert\PositiveOrZero]
    #[Groups(['task:read', 'task:write'])]
    private ?int $position = null;

    #[ORM\Column]
    #[Groups(['task:read'])]
    private ?\DateTimeImmutable $createdAt = null;

    public function __construct()
    {
        $this->createdAt = new \DateTimeImmutable();
    }

    public function getId(): ?int
    {
        return $this->id;
    }

    public function getName(): ?string
    {
        return $this->name;
    }

    public function setName(string $name): static
    {
        $this->name = $name;

        return $this;
    }

    public function getPosition(): ?int
    {
        return $this->position;
    }

    public function setPosition(int $position): static
    {
        $this->position = $position;

        return $this;
    }

    public function getCreatedAt(): ?\DateTimeImmutable
    {
        return $this->createdAt;
    }

    public function setCreatedAt(\DateTimeImmutable $createdAt): static
    {
        $this->createdAt = $createdAt;

        return $this;
    }
}
