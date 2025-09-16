import { IconArrowNarrowRight } from '@tabler/icons-react';


export default function Button() {
    return (
        <button className="inline-flex items-center cursor-pointer bg-primary text-primary-foreground
                            flex-nowrap whitespace-nowrap overflow-hidden
                            border border-solid border-transparent rounded-full
                            transition-all duration-300 ease-[var(--tw-ease,var(--default-transition-timing-function))]
                            text-[var(--text-base)]
                            leading-[var(--tw-leading,var(--text-base--line-height))]
                            font-[var(--font-weight-medium)] capitalize
                            gap-x-[calc(var(--spacing)*4)]
                            pl-[calc(var(--spacing)*8)] pr-[calc(var(--spacing)*2)]
                            py-[calc(var(--spacing)*3)]">
             Get Started 
            <span className="">
                <IconArrowNarrowRight />
            </span>
        </button>
    )
}