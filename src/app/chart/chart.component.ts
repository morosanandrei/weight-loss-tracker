import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { data } from './chart.data';
import {
  getWeek,
  startOfWeek,
  endOfWeek,
  isEqual,
  closestTo,
  format,
} from 'date-fns';

@Component({
  selector: 'app-chart',
  templateUrl: './chart.component.html',
  styleUrls: ['./chart.component.css'],
})
export class ChartComponent implements OnInit {
  public processedData: any;
  public basicOptions: any;
  public weightData: any;
  public currentWeekDelta: string = '';
  public totalWeightLoss: string = '';

  constructor(private httpClient: HttpClient) {}

  ngOnInit(): void {
    this.httpClient
      .get('http://localhost:3000/api/weightentry')
      .subscribe((res) => {
        this.processData(res);
        this.composeWeightData();

        this.currentWeekDelta = this.getWeightDiff(new Date());
        this.totalWeightLoss = this.getTotalWeightLoss();
      });
  }

  processData(data: any) {
    this.processedData = data['objects']
      .reverse()
      // .filter((data: any) => new Date(data.date) > new Date('2021-09-30'))
      .reduce(
        (previousEntry: any, entry: any) => {
          return {
            labels: [
              ...previousEntry.labels,
              new Date(new Date(entry.date).setHours(0)),
            ],
            data: [...previousEntry.data, (entry.weight * 0.453592).toFixed(1)],
          };
        },
        { labels: [], data: [] }
      );
  }

  composeWeightData() {
    this.weightData = {
      labels: this.processedData.labels.map((date: any) =>
        format(date, 'EEE d MMM')
      ),
      datasets: [
        {
          label: 'Weight',
          data: this.processedData.data,
          fill: false,
          borderColor: '#FFA726',
          tension: 0.4,
        },
      ],
    };
  }

  getWeightDiff(date?: any) {
    if (!date) {
      date = new Date();
    }

    const firstDay = startOfWeek(date, { weekStartsOn: 1 });
    const lastDay = endOfWeek(date, { weekStartsOn: 1 });

    const firstDayWeight = this.getWeightFromDay(firstDay);
    const lastDayWeight = this.getWeightFromDay(lastDay);
    const deltaWeight = firstDayWeight - lastDayWeight;
    return deltaWeight.toFixed(2);
  }

  getTotalWeightLoss() {
    const firstDay = this.processedData.labels[0];
    const lastDay =
      this.processedData.labels[this.processedData.labels.length - 1];

    const firstDayWeight = this.getWeightFromDay(firstDay);
    const lastDayWeight = this.getWeightFromDay(lastDay);

    const deltaWeight = firstDayWeight - lastDayWeight;
    return deltaWeight.toFixed(2);
  }

  getWeightFromDay(date: any) {
    const day = this.processedData.labels.findIndex((day: any) =>
      isEqual(day, date)
    );
    if (this.processedData.data[day] === undefined) {
      const closestDay = this.getClosestDate(new Date());
      return this.processedData.data[
        this.findIndexOfClosestDayInRecords(closestDay)
      ];
    } else {
      return this.processedData.data[day];
    }
  }

  findIndexOfClosestDayInRecords(date: any): number {
    return this.processedData.labels.findIndex((record: any) =>
      isEqual(record, date)
    );
  }

  getClosestDate(week: any): Date {
    const lastDay = endOfWeek(week, { weekStartsOn: 1 });
    const closestDay = closestTo(lastDay, this.processedData.labels);
    return closestDay;
    // const allRecords = this.processedData.labels.filter((day:any) => is)
  }
}
