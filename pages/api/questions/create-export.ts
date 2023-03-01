import {parse as json2csv} from 'json2csv';
import ExcelJS from 'exceljs';
import {humanise} from '@/utils/helpers';
import type {Question} from '@/types/question';

interface ExportedQuestion extends Partial<Omit<Question, 'options'>> {
    options: string;
}

type FileType = 'csv' | 'excel';

const generateCsv = async (questions: ExportedQuestion[]) => {
    const csv = json2csv(questions);

    // The UTF BOM is used to fix encoding issues with Arabic characters (and others, no doubt)
    // https://stackoverflow.com/questions/19492846/javascript-to-csv-export-encoding-issue
    const csvAndBOM = `${csv}\uFEFF`;

    return csvAndBOM;
};

const generateExcel = async (questions: ExportedQuestion[]) => {
    const workbook = new ExcelJS.Workbook();

    workbook.created = new Date();
    workbook.modified = new Date();

    const sheet = workbook.addWorksheet();

    sheet.columns = Object.keys(questions[0]).map(key => ({
        header: humanise(key),
        key
    }));
    questions.map(item => {
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

const getExportFile = async (type: FileType, questions: Partial<Question>[]) => {
    const formattedQuestions = questions.map(question => ({
        ...question,
        options: question.options.join('|')
    }));
    const generators = {
        csv: generateCsv,
        excel: generateExcel
    };
    const fileContent = await generators[type](formattedQuestions);

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
    getFile: getExportFile,
    getFilename
};

export default createExport;
