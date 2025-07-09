import { prisma } from "../config/database";
import {
  IUser,
  CreateUserDTO,
  UpdateUserDTO,
  UserProfile,
} from "../interfaces";
import { UserRole } from "@prisma/client";

export class UserService {
  /**
   * Get user profile by ID
   */
  async getUserProfile(userId: string): Promise<UserProfile | null> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        fullName: true,
        role: true,
        points: true,
        profilePicture: true,
        gender: true,
        birthDate: true,
        createdAt: true,
      },
    });

    return user;
  }

  /**
   * Update user profile
   */
  async updateUserProfile(
    userId: string,
    data: UpdateUserDTO
  ): Promise<UserProfile | null> {
    try {
      const updatedUser = await prisma.user.update({
        where: { id: userId },
        data,
        select: {
          id: true,
          email: true,
          fullName: true,
          role: true,
          points: true,
          profilePicture: true,
          gender: true,
          birthDate: true,
          createdAt: true,
        },
      });

      return updatedUser;
    } catch (error) {
      return null;
    }
  }

  /**
   * Get user by email
   */
  async getUserByEmail(email: string): Promise<IUser | null> {
    return await prisma.user.findUnique({
      where: { email },
    });
  }

  /**
   * Create new user
   */
  async createUser(data: CreateUserDTO): Promise<IUser> {
    return await prisma.user.create({
      data: {
        ...data,
        role: UserRole.CUSTOMER, // Default role
        points: 0, // Default points
      },
    });
  }

  /**
   * Get user events (events created by user)
   */
  async getUserEvents(userId: string) {
    return await prisma.event.findMany({
      where: { organizerId: userId },
      include: {
        promotion: true,
        _count: {
          select: { transactions: true, reviews: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });
  }

  /**
   * Get user transactions (events user has registered for)
   */
  async getUserTransactions(userId: string) {
    return await prisma.transaction.findMany({
      where: { userId },
      include: {
        event: {
          include: {
            organizer: {
              select: { id: true, fullName: true, email: true },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });
  }

  /**
   * Get user reviews
   */
  async getUserReviews(userId: string) {
    return await prisma.review.findMany({
      where: { userId },
      include: {
        event: {
          select: { id: true, title: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });
  }

  /**
   * Add points to user
   */
  async addPoints(userId: string, points: number): Promise<boolean> {
    try {
      await prisma.user.update({
        where: { id: userId },
        data: {
          points: {
            increment: points,
          },
        },
      });
      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * Deduct points from user
   */
  async deductPoints(userId: string, points: number): Promise<boolean> {
    try {
      // First check if user has enough points
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { points: true },
      });

      if (!user || user.points < points) {
        return false;
      }

      await prisma.user.update({
        where: { id: userId },
        data: {
          points: {
            decrement: points,
          },
        },
      });
      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * Get user points
   */
  async getUserPoints(userId: string): Promise<number | null> {
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { points: true },
      });

      return user?.points || null;
    } catch (error) {
      return null;
    }
  }

  /**
   * Check if user exists
   */
  async userExists(userId: string): Promise<boolean> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true },
    });

    return !!user;
  }

  /**
   * Delete user (soft delete by updating status if you have it, or hard delete)
   */
  async deleteUser(userId: string): Promise<boolean> {
    try {
      await prisma.user.delete({
        where: { id: userId },
      });
      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * Get all users (admin only)
   */
  async getAllUsers(page: number = 1, limit: number = 10) {
    const skip = (page - 1) * limit;

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        select: {
          id: true,
          email: true,
          fullName: true,
          role: true,
          points: true,
          createdAt: true,
          _count: {
            select: {
              transactions: true,
              reviews: true,
            },
          },
        },
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
      }),
      prisma.user.count(),
    ]);

    return {
      data: users,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }
}

export const userService = new UserService();
