/** @format */
export const asyncWrapper = (
  fn: (req: any, res: any, next: Function) => Promise<any>
) => {
  return (req: any, res: any, next: Function) => {
    fn(req, res, next).catch((err: any) => next(err));
  };
};
