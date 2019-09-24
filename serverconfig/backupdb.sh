#!/bin/bash
pg_dump -h localhost -U gvlab -W -F t dat_gvlab > gvdat000000.tar
