
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface BudgetScheduleFormProps {
  formData: {
    budget: string;
    budget_type: string;
    start_date: string;
    end_date: string;
  };
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onBudgetTypeChange: (value: string) => void;
}

const BudgetScheduleForm = ({ formData, onChange, onBudgetTypeChange }: BudgetScheduleFormProps) => {
  return (
    <div className="border-t pt-6">
      <h4 className="text-lg font-semibold mb-4">Budget & Schedule</h4>
      
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="budget_type">Budget Type</Label>
          <Select value={formData.budget_type} onValueChange={onBudgetTypeChange}>
            <SelectTrigger>
              <SelectValue placeholder="Select budget type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="daily_budget">Daily Budget</SelectItem>
              <SelectItem value="campaign_budget">Campaign Budget</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="budget">
              {formData.budget_type === 'daily_budget' ? 'Daily Budget ($)' : 'Total Campaign Budget ($)'}
            </Label>
            <Input
              id="budget"
              name="budget"
              type="number"
              placeholder={formData.budget_type === 'daily_budget' ? 'Enter daily budget' : 'Enter total budget'}
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
    </div>
  );
};

export default BudgetScheduleForm;
