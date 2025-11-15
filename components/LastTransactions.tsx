import React from 'react';
import Card from './Card';
import TransactionItem from './TransactionItem';

export default function LastTransactions() {
  const transactions = [
    {
      image: '/images/property1.svg',
      title: '123 Maple Avenue Springfield',
      date: '12 Sep 2024, 9:29',
      amount: '$30K'
    },
    {
      image: '/images/property2.svg',
      title: 'Booking 987 Villa Street',
      date: '10 Sep 2024, 9:29',
      amount: '$10K'
    },
    {
      image: '/images/property3.svg',
      title: 'Apartment Booking On Garden Street',
      date: '8 Sep 2024, 9:29',
      amount: '$20K'
    }
  ];

  return (
    <Card>
      <div className="flex items-center justify-between mb-3 lg:mb-4">
        <h3 className="text-lg lg:text-xl font-semibold text-gray-900">Last Transactions</h3>
        <button className="text-xs lg:text-sm text-gray-600 hover:text-gray-900">
          See All
        </button>
      </div>

      <div className="divide-y divide-gray-100">
        {transactions.map((transaction, index) => (
          <TransactionItem key={index} {...transaction} />
        ))}
      </div>
    </Card>
  );
}
