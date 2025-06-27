
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface BudgetScheduleFormProps {
  formData: {
    budget: string;
    start_date: string;
    end_date: string;
  };
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const BudgetScheduleForm = ({ formData, onChange }: BudgetScheduleFormProps) => {
  return (
    <div className="border-t pt-6">
      <h4 className="text-lg font-semibold mb-4">Budget & Schedule</h4>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label htmlFor="budget">Budget</Label>
          <Input
            id="budget"
            name="budget"
            type="number"
            placeholder="Enter budget"
            value={formData.budget}
            onChange={onChange}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="start_date">Start Date</Label>
          <Input
            id="start_date"
            name="start_date"
            type="date"
            value={formData.start_date}
            onChange={onChange}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="end_date">End Date</Label>
          <Input
            id="end_date"
            name="end_date"
            type="date"
            value={formData.end_date}
            onChange={onChange}
          />
        </div>
      </div>
    </div>
  );
};

export default BudgetScheduleForm;
