/* @flow */

declare type NodeHighResTimeStamp = number;

declare module 'perf_hooks' {
  declare class Performance {
    now(): NodeHighResTimeStamp;
  }

  declare var performance: Performance;
}
