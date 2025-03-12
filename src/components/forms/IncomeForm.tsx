import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { format } from 'date-fns';

export interface IncomeFormData {
  source: string;
  amount: number;
  currency: string;
  frequency: string;
  date: string;
  description?: string;
}

interface IncomeFormProps {
  initialData?: IncomeFormData;
  onSubmit: (data: IncomeFormData) => Promise<void>;
  onCancel?: () => void;
  isEdit?: boolean;
}

const IncomeForm: React.FC<IncomeFormProps> = ({
  initialData,
  onSubmit,
  onCancel,
  isEdit = false,
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<IncomeFormData>({
    defaultValues: initialData || {
      source: '',
      amount: 0,
      currency: 'USD',
      frequency: 'monthly',
      date: format(new Date(), 'yyyy-MM-dd'),
      description: '',
    },
  });

  const onFormSubmit = async (data: IncomeFormData) => {
    setLoading(true);
    setError(null);

    try {
      await onSubmit(data);
    } catch (err: any) {
      setError(err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-4">
      {error && (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4" role="alert">
          <p>{error}</p>
        </div>
      )}

      <div>
        <label htmlFor="source" className="block text-gray-700 font-medium mb-2">
          Income Source <span className="text-red-500">*</span>
        </label>
        <div className="mt-1 relative rounded-md shadow-sm">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </div>
          <input
            id="source"
            type="text"
            {...register('source', { required: 'Income source is required' })}
            className={`input-field pl-10 ${errors.source ? 'border-red-500 pr-10' : ''}`}
            placeholder="e.g. Rental Property, Dividend, Side Project"
          />
          {errors.source && (
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
              <svg className="h-5 w-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          )}
        </div>
        {errors.source && (
          <p className="text-red-500 text-sm mt-1">{errors.source.message}</p>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label htmlFor="amount" className="block text-gray-700 font-medium mb-2">
            Amount <span className="text-red-500">*</span>
          </label>
          <div className="mt-1 relative rounded-md shadow-sm">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <span className="text-gray-500 sm:text-sm">$</span>
            </div>
            <input
              id="amount"
              type="number"
              step="0.01"
              min="0"
              {...register('amount', { 
                required: 'Amount is required',
                min: { value: 0, message: 'Amount must be positive' },
                valueAsNumber: true,
              })}
              className={`input-field pl-7 ${errors.amount ? 'border-red-500 pr-10' : ''}`}
              placeholder="0.00"
            />
            {errors.amount && (
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            )}
          </div>
          {errors.amount && (
            <p className="text-red-500 text-sm mt-1">{errors.amount.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="currency" className="block text-gray-700 font-medium mb-2">
            Currency <span className="text-red-500">*</span>
          </label>
          <div className="mt-1 relative rounded-md shadow-sm">
            <select
              id="currency"
              {...register('currency', { required: 'Currency is required' })}
              className={`input-field ${errors.currency ? 'border-red-500' : ''}`}
            >
              <option value="USD">USD - US Dollar</option>
              <option value="EUR">EUR - Euro</option>
              <option value="GBP">GBP - British Pound</option>
              <option value="JPY">JPY - Japanese Yen</option>
              <option value="CAD">CAD - Canadian Dollar</option>
              <option value="AUD">AUD - Australian Dollar</option>
            </select>
            {errors.currency && (
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            )}
          </div>
          {errors.currency && (
            <p className="text-red-500 text-sm mt-1">{errors.currency.message}</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label htmlFor="frequency" className="block text-gray-700 font-medium mb-2">
            Frequency <span className="text-red-500">*</span>
          </label>
          <div className="mt-1 relative rounded-md shadow-sm">
            <select
              id="frequency"
              {...register('frequency', { required: 'Frequency is required' })}
              className={`input-field ${errors.frequency ? 'border-red-500' : ''}`}
            >
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="biweekly">Bi-Weekly</option>
              <option value="monthly">Monthly</option>
              <option value="quarterly">Quarterly</option>
              <option value="annually">Annually</option>
            </select>
            {errors.frequency && (
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            )}
          </div>
          {errors.frequency && (
            <p className="text-red-500 text-sm mt-1">{errors.frequency.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="date" className="block text-gray-700 font-medium mb-2">
            Date <span className="text-red-500">*</span>
          </label>
          <div className="mt-1 relative rounded-md shadow-sm">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <input
              id="date"
              type="date"
              {...register('date', { required: 'Date is required' })}
              className={`input-field pl-10 ${errors.date ? 'border-red-500' : ''}`}
            />
            {errors.date && (
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            )}
          </div>
          {errors.date && (
            <p className="text-red-500 text-sm mt-1">{errors.date.message}</p>
          )}
        </div>
      </div>

      <div>
        <label htmlFor="description" className="block text-gray-700 font-medium mb-2">
          Description <span className="text-gray-400 text-sm font-normal">(Optional)</span>
        </label>
        <div className="mt-1">
          <textarea
            id="description"
            rows={3}
            {...register('description')}
            className="input-field"
            placeholder="Add additional details about this income source"
          />
        </div>
        <p className="text-sm text-gray-500 mt-1">
          Use this field to add notes or details about your income source.
        </p>
      </div>

      <div className="flex justify-end space-x-3 pt-6 border-t mt-8">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="btn-outline inline-flex items-center"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
            Cancel
          </button>
        )}
        <button 
          type="submit" 
          disabled={loading} 
          className="btn-primary inline-flex items-center"
        >
          {loading ? (
            <>
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Saving...
            </>
          ) : (
            <>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              {isEdit ? 'Update Income' : 'Add Income'}
            </>
          )}
        </button>
      </div>
    </form>
  );
};

export default IncomeForm;