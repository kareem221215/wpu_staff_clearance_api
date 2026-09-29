import { TransformFnParams } from 'class-transformer';

export const strToIntArr = ({ value }: TransformFnParams) => {
  let intArr: number[] = [];

  switch (typeof value) {
    case 'string': {
      intArr = value.split(',').map((v) => +v);

      break;
    }

    default: {
      if (Array.isArray(value)) {
        intArr = value.map((v) => +v);
      } else {
        return;
      }
    }
  }

  return intArr.filter((id) => id || id === 0);
};
