"use client";

interface CheckboxProps {
    checked?: boolean;
    children?: React.ReactNode;
}

export default function Checkbox({ checked = false, children }: CheckboxProps) {
    return (
        <div className="flex items-start space-x-2 my-2">
            <input
                type="checkbox"
                checked={checked}
                readOnly
                className="mt-1 h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <span className="text-gray-900 dark:text-gray-100">{children}</span>
        </div>
    );
}
