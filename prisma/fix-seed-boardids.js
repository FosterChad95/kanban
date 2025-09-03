/**
 * Utility to fix boardId relationships after seeding
 * This should be called after running the seed script to ensure all tasks have proper boardId relationships
 */
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function fixSeedBoardIds() {
  console.log('Fixing boardId relationships for seeded tasks...');
  
  try {
    // Find all tasks without boardId that have a column
    const tasksWithoutBoardId = await prisma.task.findMany({
      where: {
        boardId: null,
      },
      include: {
        column: true,
      },
    });

    console.log(`Found ${tasksWithoutBoardId.length} tasks without boardId`);

    if (tasksWithoutBoardId.length === 0) {
      console.log('All tasks already have boardId relationships');
      return;
    }

    // Update tasks with their column's boardId
    const updatePromises = tasksWithoutBoardId.map(task => {
      if (task.column && task.column.boardId) {
        return prisma.task.update({
          where: { id: task.id },
          data: { boardId: task.column.boardId },
        });
      }
      return Promise.resolve(null);
    });

    await Promise.all(updatePromises);
    
    console.log(`Successfully updated ${tasksWithoutBoardId.length} tasks with boardId relationships`);
    
    // Verify all tasks now have boardId
    const remainingTasksWithoutBoardId = await prisma.task.count({
      where: { boardId: null },
    });
    
    if (remainingTasksWithoutBoardId === 0) {
      console.log('✅ All tasks now have proper boardId relationships');
    } else {
      console.warn(`⚠️  Still have ${remainingTasksWithoutBoardId} tasks without boardId`);
    }
    
  } catch (error) {
    console.error('Error fixing boardId relationships:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Only run if called directly (not when imported)
if (require.main === module) {
  fixSeedBoardIds();
}

module.exports = { fixSeedBoardIds };