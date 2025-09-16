<?php

namespace App\EventListener;

use App\Entity\Task;
use App\Repository\TaskRepository;
use Doctrine\ORM\Event\PrePersistEventArgs;
use Doctrine\ORM\Event\PreRemoveEventArgs;
use Doctrine\ORM\Event\PreUpdateEventArgs;
use Symfony\Component\HttpFoundation\Exception\BadRequestException;

class TaskEventListener
{
    public function __construct(private TaskRepository $taskRepository) {}

    public function prePersist(Task $task, PrePersistEventArgs $args): void
    {
        if (!$this->taskRepository->canAddTask()) {
            throw new BadRequestException('Maximum number of tasks reached');
        }

        if ($task->getPosition() === null) {
            $task->setPosition($this->taskRepository->getNextPosition());
        }
    }

    public function preUpdate(Task $task, PreUpdateEventArgs $args): void
    {
        if ($args->hasChangedField('position')) {
            $oldPosition = $args->getOldValue('position');
            $newPosition = $args->getNewValue('position');

            if ($oldPosition !== $newPosition) {
                $this->taskRepository->updatePositions($oldPosition, $newPosition);
            }
        }
    }

    public function preRemove(Task $task, PreRemoveEventArgs $args): void
    {
        $position = $task->getPosition();
        $entityManager = $args->getObjectManager();

        $entityManager->createQuery(
            'UPDATE App\Entity\Task t
            SET t.position = t.position - 1
            WHERE t.position > :position'
        )
            ->setParameter('position', $position)
            ->execute();
    }
}
