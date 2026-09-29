//! License: Open Software License 3.0 (OSL-3.0)
//! Copyright (c) 2026 Dae Euhwa

import {
  Shield, Cog, Music, Brain, Folder, PawPrint, MonitorDot, Terminal, Server, Cpu,
} from 'lucide-react';

export type Status = 'stable' | 'early' | 'archived';

export type Artifact = (typeof ARTIFACTS)[number];

export const ARTIFACTS = [
  {
    id: 'voix', name: 'voix', label: 'Voix', lang: 'C++',
    role: 'privilege management', licence: 'OSL-3.0',
    status: 'stable' as Status, Icon: Shield,
    descKey: 'projects.voix.description',
    topics: ['security', 'system', 'c++'],
  },
  {
    id: 'verdandi', name: 'verdandi', label: 'Verdandi', lang: 'Rust',
    role: 'operating system', licence: 'OSL-3.0',
    status: 'early' as Status, Icon: Cpu,
    descKey: 'projects.verdandi.description',
    topics: ['os', 'kernel', 'security'],
  },
  {
    id: 'heimdallr', name: 'heimdallr', label: 'Heimdallr', lang: 'Rust',
    role: 'dns resolver', licence: 'OSL-3.0',
    status: 'stable' as Status, Icon: Server,
    descKey: 'projects.heimdallr.description',
    topics: ['dns', 'security', 'rust'],
  },
  {
    id: 'galdr', name: 'galdr', label: 'Galdr', lang: 'Rust',
    role: 'initramfs generator', licence: 'OSL-3.0',
    status: 'stable' as Status, Icon: Cog,
    descKey: 'projects.galdr.description',
    topics: ['system', 'initramfs'],
  },
  {
    id: 'wuming', name: 'wuming', label: 'WuMing', lang: 'C',
    role: 'antivirus frontend', licence: 'GPL-3.0',
    status: 'stable' as Status, Icon: Terminal,
    descKey: 'projects.wuming.description',
    topics: ['gtk', 'security'],
  },
  {
    id: 'meshiji', name: 'meshiji', label: 'Meshiji', lang: 'Dart',
    role: 'file explorer', licence: 'OSL-3.0',
    status: 'stable' as Status, Icon: Folder,
    descKey: 'projects.meshiji.description',
    topics: ['flutter', 'ui'],
  },
  {
    id: 'peguni', name: 'peguni_draem-la', label: "Peguni Draem'la", lang: 'Lua',
    role: 'terminal companion', licence: 'OSL-3.0',
    status: 'archived' as Status, Icon: PawPrint,
    descKey: 'projects.peguni.description',
    topics: ['game', 'conlang'],
  },
  {
    id: 'ljod', name: 'ljod', label: 'Ljod', lang: 'Kotlin',
    role: 'audio forge', licence: 'OSL-3.0',
    status: 'early' as Status, Icon: Music,
    descKey: 'projects.ljod.description',
    topics: ['audio', 'android'],
  },
  {
    id: 'dds', name: 'dds', label: 'DDS', lang: 'Rust',
    role: 'discord rich presence', licence: 'OSL-3.0',
    status: 'stable' as Status, Icon: MonitorDot,
    descKey: 'projects.dds.description',
    topics: ['wayland', 'rust'],
  },
  {
    id: 'llamacpp-ui', name: 'llamacpp-ui', label: 'llama.cpp UI', lang: 'TypeScript',
    role: 'local ai interface', licence: 'OSL-3.0',
    status: 'early' as Status, Icon: Brain,
    descKey: 'projects.llamacpp_ui.description',
    topics: ['web', 'ai'],
  },
];

