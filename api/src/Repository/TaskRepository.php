<?php

namespace App\Repository;

use App\Entity\Task;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

/**
 * @extends ServiceEntityRepository<Task>
 */
class TaskRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, Task::class);
    }

    public function getNextPosition(): int
    {
        $maxPosition = $this->createQueryBuilder('t')
            ->select('MAX(t.position)')
            ->getQuery()
            ->getSingleScalarResult();

        return $maxPosition ? $maxPosition + 1 : 1;
    }

    public function canAddTask(): bool
    {
        $count = $this->createQueryBuilder('t')
            ->select('COUNT(t)')
            ->getQuery()
            ->getSingleScalarResult();

        return $count < 10;
    }

    public function updatePositions(int $fromPosition, int $toPosition): void
    {
        $entityManager = $this->getEntityManager();

        if ($fromPosition < $toPosition) {
            $entityManager->createQuery(
                'UPDATE App\Entity\Task t
                SET t.position = t.position -1
                WHERE t.position > :fromPosition AND t.position <= :toPosition'
            )
                ->setParameter('fromPosition', $fromPosition)
                ->setParameter('toPosition', $toPosition)
                ->execute();
        } else {
            $entityManager->createQuery(
                'UPDATE App\Entity\Task t
                SET t.position = t.position + 1
                WHERE t.position >= :toPosition AND t.position < :fromPosition'
            )
                ->setParameter('fromPosition', $fromPosition)
                ->setParameter('toPosition', $toPosition)
                ->execute();
        }
    }
}
