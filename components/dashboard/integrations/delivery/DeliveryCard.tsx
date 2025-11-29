"use client";

import React from 'react';

export default function DeliveryCard({ title, children, logo }: { title: string; children: React.ReactNode; logo?: React.ReactNode }) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-4">
          {logo && <div className="w-12 h-12 flex items-center justify-center rounded-lg bg-gray-50 dark:bg-gray-700">{logo}</div>}
          <div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">{title}</h3>
          </div>
        </div>
      </div>
      <div className="mt-4">{children}</div>
    </div>
  );
}
