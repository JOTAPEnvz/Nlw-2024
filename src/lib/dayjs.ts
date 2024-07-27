import LocalizedFormat from "dayjs/plugin/localizedFormat";
import "dayjs/locale/pt-br";
import exp from "constants";
import dayjs from "dayjs";

dayjs.locale('pt-br');
dayjs.extend(LocalizedFormat);

export { dayjs };