import { createQueue, QueueTask } from "./queues.js";
import { expect, test } from "vitest";

type Task = QueueTask & { id: number };

test("prioritization", async () => {
  {
    let ids: number[] = [];

    const queue = createQueue<Task>({
      executeTask: (task: Task) => {
        ids.push(task.id);
      },
    });

    queue.setQueue([
      { id: 1, priority: 1 },
      { id: 2, priority: 2 },
    ]);

    expect(ids[0]).toBe(2);
  }

  {
    const promise = new Promise((resolve) => {
      let ids: number[] = [];

      const queue = createQueue<Task>({
        executeTask: async (task: Task) => {
          const promise = new Promise((resolve) => {
            setTimeout(() => {
              ids.push(task.id);
              resolve(undefined);
            }, 100);
          });

          await promise;
        },
      });

      queue.setTask({ id: 1, priority: 1 });
      queue.setTask({ id: 2, priority: 2 });
      queue.setTask({ id: 3, priority: 3 });

      setTimeout(() => {
        expect(queue.getQueue().length).toBe(0);
        expect(ids).toEqual([1, 3, 2]);

        resolve(undefined);
      }, 1000);
    });

    await promise;
  }
});

test("privileged execution", async () => {
  const promise = new Promise((resolve) => {
    let ids: number[] = [];

    const queue = createQueue<Task>({
      executeTask: async (task: Task) => {
        const promise = new Promise((resolve) => {
          setTimeout(() => {
            ids.push(task.id);
            resolve(undefined);
          }, 100);
        });

        await promise;
      },
    });

    queue.setTask({ id: 1 });
    queue.setTask({ id: 2 });

    expect(queue.getQueue().length).toBe(1);

    queue.setTask({ id: 3, privileged: true });

    expect(queue.getQueue().length).toBe(1);

    queue.setTask({ id: 4 });

    expect(queue.getQueue().length).toBe(1);
    expect(queue.getQueue()[0].privileged).toBe(true);

    queue.setTask({ id: 5, privileged: true });

    expect(queue.getQueue().length).toBe(1);

    setTimeout(() => {
      expect(queue.getQueue().length).toBe(0);
      expect(ids).toEqual([1, 5]);

      queue.setTask({ id: 1 });
      queue.setTask({ id: 2 });

      expect(queue.getQueue().length).toBe(1);
      resolve(undefined);
    }, 1000);
  });

  await promise;
});