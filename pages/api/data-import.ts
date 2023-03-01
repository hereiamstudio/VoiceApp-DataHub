import type {NextApiRequest, NextApiResponse} from 'next';
import {captureException, withSentry} from '@sentry/nextjs';
import {IncomingForm} from 'formidable';
import ExcelJS from 'exceljs';
import strings from '@/locales/api/en.json';

const formatValue = value => {
    if (value?.text) {
        if (value.text?.richText) {
            value = value.text.richText.reduce((acc, cur) => cur.text, '');
        }
    }

    return value || '';
};

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
    const form = new IncomingForm({
        keepExtensions: true,
        maxFileSize: 5000000,
        uploadDir: '/tmp'
    });

    form.parse(req, async (err, fields, files) => {
        if (err) {
            let error = strings.errors.api_uncaught_error;

            if (err.message.includes('maxFileSize exceeded')) {
                error = strings.errors.api_max_filesize;
            }

            return res.status(500).json({error});
        }

        try {
            const workbook = new ExcelJS.Workbook();
            const workbookData = await workbook.xlsx.readFile(files.file.filepath);
            const worksheet = workbookData.getWorksheet('Data') || workbookData.worksheets[0];
            const data = [];
            let dataKeys;

            worksheet.eachRow((row, rowNumber) => {
                // @ts-ignore
                const values = Array.from(row.values).filter((_, i) => i > 0);

                if (rowNumber === 1) {
                    dataKeys = values;
                } else {
                    // @ts-ignore
                    data.push(
                        values.reduce(
                            (acc, cur, index) => ({
                                ...acc,
                                [dataKeys[index]]: formatValue(cur)
                            }),
                            {}
                        )
                    );
                }
            });

            res.status(200).json(data);
        } catch (error) {
            console.log(error);
            captureException(error);
            res.status(500).json({
                code: 'api_uncaught_error',
                message: error?.error || strings.errors.api_uncaught_error
            });
        }
    });
};

export const config = {api: {bodyParser: false, externalResolver: true}};

export default withSentry(handler);
