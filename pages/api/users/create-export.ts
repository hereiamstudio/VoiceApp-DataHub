import {parse as json2csv} from 'json2csv';
import ExcelJS from 'exceljs';
import dayjs from 'dayjs';
import omit from 'lodash/omit';
import type {Timestamp} from '@/types/firebase';
import type {User} from '@/types/user';
import {COUNTRIES} from '@/utils/countries';
import {humanise} from '@/utils/helpers';

interface ExportedUser extends Partial<Omit<User, 'updated_by' | 'created_by'>> {
    invited_by: string;
}

type FileType = 'csv' | 'excel';

// TODO: Abstract commonly used export functions
const generateCsv = async (users: ExportedUser[]) => {
    const csv = json2csv(users);

    // The UTF BOM is used to fix encoding issues with Arabic characters (and others, no doubt)
    // https://stackoverflow.com/questions/19492846/javascript-to-csv-export-encoding-issue
    const csvAndBOM = `${csv}\uFEFF`;

    return csvAndBOM;
};

const generateExcel = async (users: ExportedUser[]) => {
    const workbook = new ExcelJS.Workbook();

    workbook.created = new Date();
    workbook.modified = new Date();

    const sheet = workbook.addWorksheet();

    sheet.columns = Object.keys(users[0]).map(key => ({
        header: humanise(key),
        key
    }));
    users.map(item => {
        sheet.addRow(Object.values(item));
    });

    sheet.columns.forEach(column => {
        let maxColumnLength = 0;

        column.eachCell({includeEmpty: true}, cell => {
            maxColumnLength = Math.max(
                maxColumnLength,
                10,
                cell.value ? cell.value.toString().length : 0
            );
        });

        column.width = maxColumnLength + 2;
    });

    const buffer = await workbook.xlsx.writeBuffer();

    return buffer;
};

const getTime = (timestamp: Timestamp) => {
    // @ts-ignore
    if (timestamp?._seconds) {
        // @ts-ignore
        return timestamp._seconds; // 1000;
    } else {
        return timestamp;
    }
};

const isKeyExcluded = (key: string, excludeKeys: string[]) => {
    const isExcluded = excludeKeys.map(excludeKey => {
        // We use 'endsWith' here as when filtering proofs, stars, etc., the keys start with the question numbers,
        // this means that we won't be able to do strict equal check.
        return key.endsWith(excludeKey);
    });

    return isExcluded.includes(true);
};

const filterUser = (user: any, filters: {[key: string]: string | string[]}) => {
    let filteredUser = user;

    if (filters?.exclude) {
        const exclude =
            typeof filters.exclude === 'string' ? filters.exclude.split(',') : filters.exclude;

        filteredUser = Object.keys(user)
            .filter(key => !isKeyExcluded(key, exclude))
            .reduce((obj, key) => {
                obj[key] = user[key];
                return obj;
            }, {});
    }

    return filteredUser;
};

const getContent = (users: Partial<User>[], filters: any) => {
    const columns = [
        'first_name',
        'last_name',
        'role',
        'company',
        'email',
        'country',
        'is_available_for_projects',
        'invited_by',
        'last_active',
        'is_archived',
        'created_at',
        'updated_at'
    ];
    const transformedUsers = users.map(user => {
        return {
            ...omit(user, 'active', 'company_name', 'updated_by', 'created_by'),
            ...{
                company: user.company_name,
                country: COUNTRIES[user.country],
                role: humanise(user.role),
                invited_by: `${user.created_by.first_name} ${user.created_by.last_name}`,
                is_archived: user.is_archived ? 'Yes' : 'No',
                is_available_for_projects: user.is_available_for_projects ? 'Yes' : 'No',
                last_active: user?.active
                    ? dayjs(getTime(user.active)).format('MMMM D YYYY, H:mma')
                    : '',
                created_at: dayjs(getTime(user.created_at)).format('MMMM D YYYY, H:mma'),
                updated_at: dayjs(getTime(user.updated_at)).format('MMMM D YYYY, H:mma')
            }
        };
    });
    const formattedUsers = transformedUsers
        .map(user => {
            return columns.reduce((acc, cur) => ({...acc, [cur]: user[cur]}), {});
        })
        .map(user => filterUser(user, filters));

    return formattedUsers;
};

const getExportFile = async (type: FileType, users: Partial<User>[]) => {
    const generators = {
        csv: generateCsv,
        excel: generateExcel
    };
    // @ts-ignore
    const fileContent = await generators[type](users);

    return fileContent;
};

const getFilename = (title: string, type: FileType) => {
    const extensions = {
        excel: 'xlsx',
        csv: 'csv'
    };

    return `${encodeURIComponent(title)}.${extensions[type]}`;
};

const createExport = {
    getContent,
    getFile: getExportFile,
    getFilename
};

export default createExport;
