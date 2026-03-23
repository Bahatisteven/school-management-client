const Student = require('../models/Student');
const FeeTransaction = require('../models/FeeTransaction');
const FeeTransactionDTO = require('../dtos/FeeTransactionDTO');
const { NotFoundError, InsufficientBalanceError, ValidationError } = require('../utils/errors');
const { 
  PAGINATION,
  TRANSACTION_STATUS,
  TRANSACTION_TYPES,
} = require('../config/constants');

class FeeService {
  async deposit(studentId, amount, description, processedBy) {
    if (amount <= 0) {
      throw new ValidationError('Amount must be greater than zero');
    }

    const student = await Student.findById(studentId);
    if (!student) {
      throw new NotFoundError('Student');
    }

    student.feeBalance += amount;
    const balanceAfter = student.feeBalance;
    await student.save();

    const transaction = new FeeTransaction({
      studentId,
      type: TRANSACTION_TYPES.DEPOSIT,
      amount,
      description: description || 'Fee deposit',
      status: TRANSACTION_STATUS.COMPLETED,
      processedBy,
      balanceAfter,
    });

    await transaction.save();

    return {
      transaction: FeeTransactionDTO.toClient(transaction),
      newBalance: balanceAfter,
    };
  }

  async withdraw(studentId, amount, description, processedBy) {
    if (amount <= 0) {
      throw new ValidationError('Amount must be greater than zero');
    }

    const student = await Student.findById(studentId);
    if (!student) {
      throw new NotFoundError('Student');
    }

    if (student.feeBalance < amount) {
      throw new InsufficientBalanceError(
        `Insufficient balance. Available: ${student.feeBalance}, Requested: ${amount}`
      );
    }

    student.feeBalance -= amount;
    const balanceAfter = student.feeBalance;
    await student.save();

    const transaction = new FeeTransaction({
      studentId,
      type: TRANSACTION_TYPES.WITHDRAW,
      amount,
      description: description || 'Fee withdrawal',
      status: TRANSACTION_STATUS.COMPLETED,
      processedBy,
      balanceAfter,
    });

    await transaction.save();

    return {
      transaction: FeeTransactionDTO.toClient(transaction),
      newBalance: balanceAfter,
    };
  }

  async getBalance(studentId) {
    const student = await Student.findById(studentId);
    if (!student) {
      throw new NotFoundError('Student');
    }

    return {
      balance: student.feeBalance,
      studentId: student.studentId,
    };
  }

  async getTransactionHistory(studentId, limit = PAGINATION.TRANSACTION_LIMIT) {
    const transactions = await FeeTransaction.find({ studentId })
      .sort({ transactionDate: -1 })
      .limit(limit);

    return FeeTransactionDTO.toClientList(transactions);
  }
}

module.exports = new FeeService();
