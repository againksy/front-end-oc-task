import React, { Component } from 'react';

import OutsideClicker from './OutsideClicker'
import './calendar.css';

const days = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
const months = ['January','February','March','April','May','June','July','August','September','October','November','December'];

(function() {
  Date.prototype.getMonthName = function() {
    return months[ this.getMonth() ];
  };
  Date.prototype.getDayName = function() {
    return days[ this.getDay() ];
  };
})()

function addMonths(date, months) {
  var d = date.getDate();
  date.setMonth(date.getMonth() + +months);
  if (date.getDate() != d) {
    date.setDate(0);
  }
  return date;
}


function daysInMonth(month, year) {
  return 32 - new Date(year, month, 32).getDate();
}

const isIntOrNumberString = v => {
  return Number.isInteger(parseInt(v))
}

class Calendar extends Component {

  constructor(props) {
    super(props);
    const curDate    = new Date();
    this.state = {
      selectedDate: new Date(curDate),
      curDate,
      events: [],
    }
  }
  componentDidMount(){
    window.addEventListener("resize", () => this.setState({ pickedDate: null }));
  }
  componentWillUnmount() {
    window.removeEventListener("resize", this.updateDimensions);
  }

  moveMonth(dir){
    let { selectedDate, } = this.state
    if(dir === 'left'){
      this.setState({
        selectedDate: addMonths(selectedDate, -1),
        pickedDate: null,
      })
    }else if(dir === 'right'){
      this.setState({
        selectedDate: addMonths(selectedDate, 1),
        pickedDate: null,
      })
    }
    return null
  }
  showEventPicker({e, dayInMonth, displayMonth, displayYear, }){
    const {pickedDate} = this.state
    this.setState({
      pickedDate: {
        cellWidth: e.currentTarget.offsetWidth,
        dayInMonth, displayMonth, displayYear,
      }
    })
  }
  setNewEventName(e){
    let name = e.target.value
    if(typeof name !== 'string' || name.length > 128)return;
    this.setState({newEventName: e.target.value})
  }
  setNewEventMinute(e){
    let minute = +e.target.value
    if(minute > 59 || minute < 0){
      return null
    }
    this.setState({newEventMinute: minute})
  }
  setNewEventHour(e){
    let hour = +e.target.value
    if(hour > 23 || hour < 0){
      return null
    }
    this.setState({newEventHour: hour})
  }
  saveEvent(p){
    const { pickedDate, newEventMinute, newEventHour, newEventName, events, } = this.state
    if(!newEventName || !isIntOrNumberString(newEventMinute) || !isIntOrNumberString(newEventHour))return;
    const {dayInMonth, displayMonth, displayYear,} = pickedDate
    const eventDate = new Date(displayYear, displayMonth, dayInMonth, newEventHour, newEventMinute, 0, 0)
    console.log('saving event to »»»» ', eventDate)
    this.setState({
      pickedDate: null,
      events: [...events, {
        eventDate,
        newEventName,
      }]
    })
  }

  clearPicked(){
    this.setState({ pickedDate: null })
  }
  render() {
    const { selectedDate, curDate, pickedDate, newEventMinute, newEventHour, newEventName, events, } = this.state

    let weekDays = days.map((d,i)=>{
      return <div className="" key={i}>{d.substring(0, 2)}</div>
    })
    let displayYear = selectedDate.getFullYear()
    let displayMonth = selectedDate.getMonth()
    let firstDay = (new Date(displayYear, displayMonth)).getDay()
    let day = 1;
    let cells = []
    let daysInDisplayedMonth = daysInMonth(displayMonth, displayYear)
    for (let i = 0; i < 6; i++) {
      for (let j = 0; j < 7; j++) {
        if (i === 0 && j < firstDay) {
          let prevMonth = addMonths(new Date(selectedDate), -1)
          let prevMonthIDX = prevMonth.getMonth()
          let daysInPrevMonth = daysInMonth(prevMonthIDX, displayYear)
          let displayPrevMonthDaysFrom = daysInPrevMonth-firstDay+1
          cells.push(<div key={i+'_'+j+'_'+displayPrevMonthDaysFrom+j} className="calendar-cell empty_day-cell">{displayPrevMonthDaysFrom+j}</div>)
        } else if (day > daysInDisplayedMonth) {
          cells.push(<div key={i+'_'+j} className="calendar-cell empty_day-cell">{j}</div>)
        } else {
          let cc = "calendar-cell filled-cell"
          if (day === curDate.getDate() && displayYear === curDate.getFullYear() && displayMonth === curDate.getMonth()) {
            cc = cc + " current-day-cell"
          }
          let eventPickerStl = {}
          let showEP = e => this.showEventPicker({ e, dayInMonth, displayMonth, displayYear, })
          let currentCellEventPicker = pickedDate && pickedDate.dayInMonth === day && pickedDate.displayMonth === displayMonth && pickedDate.displayYear === displayYear
          if(currentCellEventPicker){
            eventPickerStl.display = 'block'
            eventPickerStl.left = -((200 - pickedDate.cellWidth)/2)
            showEP = () => null
          }
          let dayInMonth = +day
          cells.push(<div key={i+'_'+j} onClick={showEP} className={cc}>
                {day}
                  <div style={eventPickerStl} className="event-picker">
                      <div className="ep-inputs" >
                        <div className="epi-top">
                          <input value={newEventHour || ''} onChange={e=>this.setNewEventHour(e)} placeholder="Hour" type="text" name="hour" />
                          <input value={newEventMinute || ''} onChange={e=>this.setNewEventMinute(e)} placeholder="Minute" type="text" name="minute" />
                        </div>
                        <input value={newEventName || ''} onChange={e=>this.setNewEventName(e)} placeholder="Event name" type="text" name="event_name" />
                        <div onClick={()=>this.saveEvent({})} className="ep-save">Save</div>
                      </div>
                  </div>
            </div>)
          day++;
        }
      }
    }

    let displayEvents = events.filter(e=>{
      let { eventDate, } = e
      let ey = eventDate.getFullYear();
      let em = eventDate.getMonth()
      return em === displayMonth && ey === displayYear
    })
    displayEvents.sort((a,b)=>{
      return new Date(a.eventDate) - new Date(b.eventDate)
    });
    return (
        <div className="calendar-wrap">
          <div className="calendar-header" >
            <i onClick={()=>this.moveMonth('left')} className="left"></i>
            <i onClick={()=>this.moveMonth('right')} className="right"></i>
            <div className="selected-date">
              <div>
                {selectedDate.getMonthName()}
              </div>
              <div className="s_year">
                {selectedDate.getFullYear()}
              </div>
            </div>
          </div>
          <div className="calendar-body">
            <div className="calendar-week-days">
              {weekDays}
            </div>
            <OutsideClicker onOutsideClick={()=>this.clearPicked()}>
              <div className="calendar-cells">
                {cells}
              </div>
            </OutsideClicker>
          </div>
          <div className="ca-events">
            {displayEvents.map((e,i)=>{
              let { eventDate, newEventName, } = e
              let month = eventDate.getMonthName();
              let day = eventDate.getDate();
              let year = eventDate.getFullYear();
              let hour= eventDate.getHours();
              let min= eventDate.getMinutes();
              return <div key={i} className="ca-event">{day+' '+month+' '+year+' '+hour+'-'+min+' - '+newEventName}</div>
            }) }
          </div>
        </div>
    );
  }
}

export default Calendar
