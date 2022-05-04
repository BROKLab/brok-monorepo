import { Box, Button, Grid, Header, Text, TextInput } from 'grommet';
import React, { useEffect } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { useBrok } from '../context/useBrok';

interface Props {}
interface FormData {
  username: string;
}

export const Login: React.FC<Props> = ({ ...props }) => {
  const { username, setUsername, isLoggedIn } = useBrok();
  const {
    handleSubmit,
    control,
    setValue,
    getValues,
    formState: { errors, isSubmitting, isDirty },
  } = useForm<FormData>({
    defaultValues: {
      username: username,
    },
  });
  useEffect(() => {
    setValue('username', username);
  }, [username]);

  const onSubmit = handleSubmit(async () => {
    // Hack, because onChange does not propegate update string values.
    const values = getValues();
    setUsername(values.username);
  });
  return (
    <Box elevation="small" pad={'medium'} width="medium">
      {isLoggedIn ? (
        <Box gap="small">
          <Text>Du er logget inn som</Text>
          <Text>{username}</Text>
          <Button
            margin={{ top: 'medium' }}
            fill="horizontal"
            size="small"
            type="button"
            label={'Logg ut'}
            onClick={() => setUsername('')}
            disabled={isSubmitting}
          />
        </Box>
      ) : (
        <form onSubmit={onSubmit}>
          <Box gap="small">
            <Grid columns={['1/3', '2/3']} gap="small">
              <Text alignSelf="center">Brukernavn</Text>
              <Controller
                render={({ field }) => <TextInput {...field} size="small" />}
                name="username"
                control={control}
                rules={{ required: false /* minLength: 9, maxLength: 9, */ }}
              />
            </Grid>
            <Box direction="row" gap="small">
              <Button
                margin={{ top: 'medium' }}
                fill="horizontal"
                size="small"
                type="submit"
                label={'Logg inn'}
                disabled={isSubmitting || !isDirty}
              />
            </Box>
          </Box>
        </form>
      )}
    </Box>
  );
};
