"use client"

import * as React from "react"
import { format } from "date-fns"
import { CalendarIcon } from "lucide-react"
import { type DateRange } from "react-day-picker"

import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

// ✅ ADD PROPS TYPE
type Props = {
  date: DateRange | undefined
  setDate: React.Dispatch<React.SetStateAction<DateRange | undefined>>
}

// ✅ ACCEPT PROPS HERE
export function DatePickerWithRange({ date, setDate }: Props) {
  return (

      <Popover>
        <PopoverTrigger
          render={
            <Button
              variant="outline"
              className="justify-start px-2.5 font-normal w-full"
            >
              <CalendarIcon className="mr-2 h-4 w-4" />

              {date?.from ? (
                date.to ? (
                  <>
                    {format(date.from, "LLL dd, y")} -{" "}
                    {format(date.to, "LLL dd, y")}
                  </>
                ) : (
                  format(date.from, "LLL dd, y")
                )
              ) : (
                <span>Pick a date</span>
              )}
            </Button>
          }
        />

        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="range"
            selected={date}
            onSelect={setDate}
            numberOfMonths={2}
          />
        </PopoverContent>
      </Popover>
  )
}