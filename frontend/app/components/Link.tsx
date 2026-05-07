import { Link as RouterLink, type LinkProps as RouterLinkProps } from "react-router";

export interface LinkProps extends RouterLinkProps {
    variant?: 'primary' | 'subtle' | 'danger';
}

const variantStyles = {
    primary: "text-blue-600 hover:text-blue-800 hover:underline",
    subtle: "text-gray-500 hover:text-gray-700 hover:underline",
    danger: "text-red-600 hover:text-red-800 hover:underline"
};

export function Link({ className = "", variant, ...props }: LinkProps) {
    const baseStyles = "font-medium focus:outline-none rounded-sm";
    const combinedClassName = `${baseStyles} ${variant ? variantStyles[variant] : ""} ${className}`.replace(/\s+/g, " ").trim();

    return (
        <RouterLink
            className={combinedClassName}
            {...props}
        />
    );
}
