import { z } from 'zod'

export const AuthReturn = z.object({
    readOnlyUser: z.boolean(),
    ccode: z.number(),
    boardinfo: z
        .string()
        .transform((rawBoardInfo: string) => {
            return rawBoardInfo.split('\n').reduce((acc, line) => {
                const splitty = line.split('=');

                if (splitty.length === 2) {
                    const [key, value] = splitty;

                    acc[key] = value;
                }

                if (splitty.length > 2) {
                    const key = splitty[0];
                    const value = splitty.slice(1).join('=');

                    acc[key] = value;
                }

                return acc;
            }, {} as Record<string, string>);
        }),
    rd: z.array(z.string()),
    fullVersion: z.string(),
});
export type AuthReturnType = z.infer<typeof AuthReturn>;