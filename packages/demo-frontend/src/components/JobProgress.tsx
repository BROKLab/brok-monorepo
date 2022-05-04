import { Box, Button, Meter, Tag } from 'grommet';
import React, { useEffect, useState } from 'react';
import { useHistory } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useBrok } from '../context/useBrok';
import { CreateCapTableJobProgressResponse, JobProgressResponse, JobProgressResults } from '../types/brok.types';
import { useInterval } from '../utils/useInterval';
var debug = require('debug')('page:JobProgress');

interface Props {
  onDoneButtonText: string;
  onDoneAction: (jobProgressResult: JobProgressResults) => void;
  jobIds: string[];
}

export const JobProgress: React.FC<Props> = ({ ...props }) => {
  const { getProgressForJob } = useBrok();
  const [updateInterval] = useState(2000);
  const [jobs, setJobs] = useState<JobProgressResponse[]>([]);
  const [watchJobIds, setWatchJobIds] = useState<string[]>([]);

  useEffect(() => {
    setWatchJobIds(props.jobIds);
  }, [props.jobIds]);

  useInterval(() => {
    const fetchProgress = async (jobId: string) => {
      debug('Fetching progress for jobID', jobId);
      const data = await getProgressForJob(jobId);
      if (data.isErr()) toast(data.error);
      else {
        debug('Got progress for job:', data);
        if (data.value.jobStatus === 'failed') {
          debug(`Stop watcing this job for changes ${jobId}`);
          setWatchJobIds(watchJobIds.filter((id) => id !== jobId));
        }
        if (data.value.jobStatus === 'completed') {
          debug(`Stop watcing this job for changes because its completed ${jobId}`);
          setWatchJobIds(watchJobIds.filter((id) => id !== jobId));
          if (data.value.result) {
            if (data.value.result.success) {
              props.onDoneAction(data.value.result);
            }
          } else {
            debug('result is undefined for job completed');
          }
        }
        setJobs((old) => [...old.filter((job) => job.id !== jobId), data.value]);
      }
    };
    watchJobIds.forEach((jobId) => {
      if (jobId === '') {
        debug('job id is empty');
        return;
      }
      fetchProgress(jobId);
    });
  }, updateInterval);

  return (
    <Box>
      {jobs.map((job) => (
        <Box key={job.id} elevation="small" gap="medium" pad={'small'}>
          <Tag size="small" name="Status" value={job.jobStatus} />
          <Tag size="small" name="Type" value={job.name} />
          <Box align="center">
            <Meter
              values={[
                {
                  value: job.progress,
                  label: job.jobStatus,
                  onClick: () => {},
                },
              ]}
              type="circle"
              size="small"
              max={100}
              color={'accent-1'}
              aria-label="meter"
            ></Meter>
          </Box>
        </Box>
      ))}
    </Box>
  );
};
