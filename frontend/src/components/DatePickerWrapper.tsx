import React from 'react';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { DatePicker as MuiDatePicker, TimePicker as MuiTimePicker } from '@mui/x-date-pickers';
import { TextField } from '@mui/material';

interface DatePickerWrapperProps {
    children: React.ReactNode;
}

export const DatePickerWrapper: React.FC<DatePickerWrapperProps> = ({ children }) => {
    return (
        <LocalizationProvider dateAdapter={AdapterDateFns}>
            {children}
        </LocalizationProvider>
    );
};

// Custom TimePicker with restricted hours
interface RestrictedTimePickerProps {
    label?: string;
    value?: Date | null;
    onChange: (value: Date | null) => void;
    [key: string]: any;
}

export const TimePicker: React.FC<RestrictedTimePickerProps> = ({ 
    label = "Pickup Time", 
    value, 
    onChange, 
    ...props 
}) => {
    // Function to check if time is within allowed ranges
    const shouldDisableTime = (value: Date, clockType: string) => {
        if (clockType === 'hours') {
            const hour = value.getHours();
            // Allow 8-12 (8am-12pm) and 13-15 (1pm-3pm)
            return !(
                (hour >= 8 && hour <= 12) || 
                (hour >= 13 && hour <= 15)
            );
        }
        return false;
    };

    return (
        <MuiTimePicker
            label={label}
            value={value}
            onChange={onChange}
            shouldDisableTime={shouldDisableTime}
            views={['hours', 'minutes']}
            format="hh:mm a"
            ampm={true}
            {...props}
        />
    );
};

// Export the DatePicker as is
export const DatePicker = MuiDatePicker;