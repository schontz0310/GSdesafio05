import { getCustomRepository, getRepository } from 'typeorm';
import AppError from '../errors/AppError';
import TransactionsRepository from '../repositories/TransactionsRepository';

import Transaction from '../models/Transaction';
import Category from '../models/Category';

interface Request {
  title: string;
  value: number;
  type: 'income' | 'outcome';
  category: string;
}

class CreateTransactionService {
  public async execute({
    title,
    value,
    type,
    category,
  }: Request): Promise<Transaction> {
    const transactionsRepository = getCustomRepository(TransactionsRepository);
    const categoryRepository = getRepository(Category);

    const { total } = await transactionsRepository.getBalance();

    if (type === 'outcome' && total < value) {
      throw new AppError('You do not havve Enough balance!');
    }

    let categoryTitle = await categoryRepository.findOne({
      where: {
        title: category,
      },
    });
    if (!categoryTitle) {
      categoryTitle = categoryRepository.create({
        title: category,
      });
      await categoryRepository.save(categoryTitle);
    }

    const transaction = transactionsRepository.create({
      title,
      value,
      type,
      category: categoryTitle,
    });
    await transactionsRepository.save(transaction);
    return transaction;
  }
}

export default CreateTransactionService;
